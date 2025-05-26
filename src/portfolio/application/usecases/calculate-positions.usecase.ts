import { BadRequestException, Inject } from '@nestjs/common';
import { Order } from 'src/orders/domain/models/order.model';
import { Position } from 'src/portfolio/domain/models/position.model';
import { OrderSide } from 'src/orders/domain/enums/order-side.enum';
import { InstrumentType } from 'src/instruments/domain/enums/instrument-type.enum';
import { IMarketRepository } from 'src/market/domain/repositories/market-data.repository.interface';

export class CalculatePositionsByOrdersUseCase {
	constructor(
		@Inject('IMarketRepository')
		private readonly marketDataRepository: IMarketRepository,
	) {}

	async execute(orders: Order[]): Promise<Position[]> {
		const nonCurrencyOrders = orders.filter(
			(o) => o.getInstrument().getType() !== InstrumentType.CURRENCY,
		);

		const groupedOrders = new Map<string, Order[]>();

		for (const order of nonCurrencyOrders) {
			const ticker = order.getInstrument().getTicker();
			if (!groupedOrders.has(ticker)) {
				groupedOrders.set(ticker, []);
			}
			groupedOrders.get(ticker)!.push(order);
		}

		const instrumentIds = Array.from(
			new Set(nonCurrencyOrders.map((o) => o.getInstrument().getId())),
		);

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

		const marketPriceMap = new Map<number, number>();
		for (const marketData of marketDataArray) {
			if (marketData) {
				marketPriceMap.set(
					marketData.getInstrumentId(),
					marketData.getClose(),
				);
			}
		}

		const positions: Position[] = [];

		for (const orders of groupedOrders.values()) {
			const instrument = orders[0].getInstrument();
			const id = instrument.getId();
			const marketPrice = marketPriceMap.get(id);

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

			if (totalQuantity <= 0) continue;

			const avgBuyPrice = totalBuyQuantity
				? totalBuyCost / totalBuyQuantity
				: 0;
			if (marketPrice === undefined) {
				throw new BadRequestException(
					`Market price not found for instrumentId ${id}`,
				);
			}
			const positionValue = totalQuantity * marketPrice;
			const performance = avgBuyPrice
				? ((marketPrice - avgBuyPrice) / avgBuyPrice) * 100
				: 0;

			positions.push(
				new Position({
					instrument,
					quantity: totalQuantity,
					positionValue,
					performance: +performance.toFixed(2),
				}),
			);
		}

		return positions;
	}
}
