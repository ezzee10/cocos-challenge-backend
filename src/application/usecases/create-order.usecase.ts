import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { OrderType } from 'src/domain/enums/order-type.enum';
import { OrderSide } from 'src/domain/enums/order-side.enum';
import { Order } from 'src/domain/models/order.model';
import { MarketData } from 'src/domain/models/market-data.model';
import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';
import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { IMarketRepository } from 'src/domain/repositories/market-data.repository.interface';
import { Instrument } from 'src/domain/models/instrument.model';
import { IInstrumentRepository } from 'src/domain/repositories/instrument.repository.interface';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { PortfolioService } from 'src/domain/services/portfolio.service';
import { InstrumentType } from 'src/domain/enums/instrument-type.enum';

@Injectable()
export class CreateOrderUseCase {
	constructor(
		private readonly orderRepository: IOrderRepository,
		private readonly marketDataRepository: IMarketRepository,
		private readonly instrumentRepository: IInstrumentRepository,
		private readonly portfolioService: PortfolioService,
	) {}

	async execute(createOrderDto: CreateOrderDto): Promise<Order> {
		const {
			instrumentId,
			userId,
			type,
			side,
			size: inputSize,
			amount,
			price,
		} = createOrderDto;

		this.validateAmountAndSize(type, amount, inputSize);

		const instrument = await this.getAndValidateInstrument(
			instrumentId,
			side,
		);

		const finalPrice = await this.calculateFinalPrice(
			type,
			side,
			instrumentId,
			price,
		);

		const size = this.calculateFinalSize(
			amount,
			inputSize,
			finalPrice,
			side,
		);

		const previousOrders = await this.getPreviousOrders(
			userId,
			OrderStatus.FILLED,
		);

		try {
			this.validateOrder(side, finalPrice, size, previousOrders);
		} catch (error) {
			const order = new Order({
				instrument,
				userId,
				size,
				price: finalPrice,
				type,
				side,
				datetime: new Date(),
			});

			order.rejectOrder();

			await this.orderRepository.save(order);
			throw error;
		}

		const order = new Order({
			instrument,
			userId,
			size,
			price: finalPrice,
			type,
			side,
			datetime: new Date(),
		});

		return this.orderRepository.save(order);
	}

	private validateOrder(
		side: OrderSide,
		price: number,
		size: number,
		previousOrders: Order[] = [],
	): void {
		this.validateAvailableCash(side, price, size, previousOrders);
		this.validateAvailableQuantityStocks(side, size, previousOrders);
	}

	private validateAvailableCash(
		side: OrderSide,
		price: number,
		size: number,
		orders: Order[],
	): void {
		if (side === OrderSide.BUY || side === OrderSide.CASH_OUT) {
			const availableCash =
				this.portfolioService.calculateAvailableCash(orders);
			if (availableCash < price * size)
				throw new ConflictException(
					'Insufficient funds to process the transaction',
				);
		}
	}

	private validateAvailableQuantityStocks(
		side: OrderSide,
		size: number,
		orders: Order[],
	): boolean {
		if (side === OrderSide.SELL) {
			const availableStocks =
				this.portfolioService.calculateQuantityAvailableStocks(orders);
			if (availableStocks < size) {
				throw new ConflictException(
					'Insufficient stocks to process the transaction',
				);
			}
		}

		return true;
	}

	private validateAmountAndSize(
		type: OrderType,
		amount?: number,
		size?: number,
	): void {
		if (amount && type !== OrderType.MARKET) {
			throw new BadRequestException(
				'Amount is only allowed for MARKET orders',
			);
		}

		if (
			(amount === undefined && size === undefined) ||
			(amount !== undefined && size !== undefined)
		) {
			throw new BadRequestException(
				'You must provide either amount or size, but not both',
			);
		}
	}

	private calculateFinalSize(
		amount?: number,
		size?: number,
		price?: number,
		orderSide?: OrderSide,
	): number {
		if (
			(orderSide === OrderSide.CASH_IN ||
				orderSide === OrderSide.CASH_OUT) &&
			!size
		)
			throw new BadRequestException(
				'Size is required for cash operations',
			);

		if (size !== undefined) return size;
		if (amount !== undefined && price !== undefined) {
			const computedSize = Math.floor(amount / price);
			if (computedSize < 1) {
				throw new ConflictException(
					`The amount (${amount}) is not enough to buy at least one unit at price ${price}`,
				);
			}
			return computedSize;
		}

		throw new BadRequestException('Data is missing to calculate size');
	}

	private async calculateFinalPrice(
		type: OrderType,
		side: OrderSide,
		instrumentId: number,
		price?: number,
	): Promise<number> {
		if (side === OrderSide.CASH_IN || side === OrderSide.CASH_OUT) {
			return 1;
		}

		if (type === OrderType.MARKET) {
			const marketData = await this.getMarketData(instrumentId);
			return marketData.getClose();
		}

		return price ?? 0;
	}

	private async getAndValidateInstrument(
		instrumentId: number,
		side: OrderSide,
	): Promise<Instrument> {
		const instrument =
			await this.instrumentRepository.getById(instrumentId);

		if (!instrument) {
			throw new ConflictException(
				`Instrument with id ${instrumentId} not found`,
			);
		}

		if (side === OrderSide.CASH_IN || side === OrderSide.CASH_OUT) {
			if (instrument.getType() !== InstrumentType.CURRENCY) {
				throw new BadRequestException(
					'Only currency instruments can be used for cash operations',
				);
			}
		} else if (instrument.getType() !== InstrumentType.STOCK) {
			throw new BadRequestException(
				'Only stock instruments can be used for stock operations',
			);
		}

		return instrument;
	}

	private async getPreviousOrders(
		userId: number,
		status: OrderStatus,
	): Promise<Order[]> {
		const orders = await this.orderRepository.getOrdersByUserIdAndStatus(
			userId,
			status,
		);

		return orders;
	}

	private async getMarketData(instrumentId: number): Promise<MarketData> {
		const marketData =
			await this.marketDataRepository.getMarketDataByInstrument(
				instrumentId,
			);
		if (!marketData)
			throw new ConflictException(
				`Market data not found for instrumentId ${instrumentId}`,
			);
		return marketData;
	}
}
