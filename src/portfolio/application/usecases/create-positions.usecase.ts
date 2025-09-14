import { BadRequestException, Inject } from '@nestjs/common';
import { Order } from 'src/orders/domain/models/order.model';
import { Position } from 'src/portfolio/domain/models/position.model';
import { OrderSide } from 'src/orders/domain/enums/order-side.enum';
import { IMarketRepository } from 'src/market/domain/repositories/market-data.repository.interface';

export class CreatePositionsByOrdersUseCase {
	constructor(
		@Inject('IMarketRepository')
		private readonly marketDataRepository: IMarketRepository,
	) {}

	async execute(orders: Order[]): Promise<Position[]> {
		const groupedOrdersByTicker = this.groupOrdersByTicker(orders);
		const instrumentIds = this.getDistinctInstrumentIds(orders);

		const marketDataMap = await this.fetchMarketDataMap(instrumentIds);

		const positions: Position[] = [];
		for (const ordersGroup of groupedOrdersByTicker.values()) {
			const position = this.createPosition(ordersGroup, marketDataMap);
			if (position) {
				positions.push(position);
			}
		}

		return positions;
	}

	private getDistinctInstrumentIds(orders: Order[]): number[] {
		return Array.from(
			new Set(orders.map((order) => order.getInstrument().getId())),
		);
	}

	private groupOrdersByTicker(orders: Order[]): Map<string, Order[]> {
		const map = new Map<string, Order[]>();
		for (const order of orders) {
			const ticker = order.getInstrument().getTicker();
			if (!map.has(ticker)) {
				map.set(ticker, []);
			}
			map.get(ticker)!.push(order);
		}
		return map;
	}

	private async fetchMarketDataMap(
		instrumentIds: number[],
	): Promise<Map<number, number>> {
		const marketDataArray = await Promise.all(
			instrumentIds.map(async (id) => {
				const data =
					await this.marketDataRepository.getMarketDataByInstrument(
						id,
					);
				if (!data) {
					throw new BadRequestException(
						`No market data found for instrumentId ${id}`,
					);
				}
				return data;
			}),
		);

		const map = new Map<number, number>();
		for (const marketData of marketDataArray) {
			map.set(marketData.getInstrumentId(), marketData.getClose());
		}
		return map;
	}

	private createPosition(
		orders: Order[],
		marketPriceMap: Map<number, number>,
	): Position | null {
		const instrument = orders[0].getInstrument();
		const instrumentId = instrument.getId();
		const marketPrice = marketPriceMap.get(instrumentId);

		if (marketPrice === undefined) {
			throw new BadRequestException(
				`Market price not found for instrumentId ${instrumentId}`,
			);
		}

		const { totalBuyQuantity, totalBuyCost, totalQuantity } =
			this.calculateOrderTotals(orders);

		if (totalQuantity <= 0) {
			return null;
		}

		const avgBuyPrice = totalBuyQuantity
			? totalBuyCost / totalBuyQuantity
			: 0;
		const positionValue = totalQuantity * marketPrice;
		const performance = avgBuyPrice
			? ((marketPrice - avgBuyPrice) / avgBuyPrice) * 100
			: 0;

		return new Position({
			instrument,
			quantity: totalQuantity,
			positionValue,
			performance: +performance.toFixed(2),
		});
	}

	private calculateOrderTotals(orders: Order[]): {
		totalBuyQuantity: number;
		totalBuyCost: number;
		totalQuantity: number;
	} {
		let totalBuyQuantity = 0;
		let totalBuyCost = 0;
		let totalQuantity = 0;

		for (const order of orders) {
			const size = order.getSize();
			const price = order.getPrice();
			if (order.getSide() === OrderSide.BUY) {
				totalBuyQuantity += size;
				totalBuyCost += size * price;
				totalQuantity += size;
			} else {
				totalQuantity -= size;
			}
		}

		return { totalBuyQuantity, totalBuyCost, totalQuantity };
	}
}
