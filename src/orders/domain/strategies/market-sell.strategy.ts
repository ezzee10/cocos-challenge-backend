import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
} from '@nestjs/common';
import { OrderCreationStrategy } from './order.strategy';
import { CreateOrderDto } from 'src/orders/presenter/dto/create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { Order } from '../models/order.model';
import { IOrderRepository } from '../repositories/order.repository.interface';
import { IMarketRepository } from 'src/market/domain/repositories/market-data.repository.interface';
import { IInstrumentRepository } from 'src/instruments/domain/repositories/instrument.repository.interface';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import { InstrumentType } from 'src/instruments/domain/enums/instrument-type.enum';
import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';

@Injectable()
export class MarketSellStrategy implements OrderCreationStrategy {
	constructor(
		@Inject('IOrderRepository')
		private readonly orderRepository: IOrderRepository,

		@Inject('IMarketRepository')
		private readonly marketDataRepository: IMarketRepository,

		private readonly portfolioService: PortfolioService,

		@Inject('IInstrumentRepository')
		private readonly instrumentRepository: IInstrumentRepository,
	) {}

	async create(dto: CreateOrderDto): Promise<Order> {
		const { instrumentId, userId, type, side, size } = dto;

		this.validateSize(size);

		const price = await this.getPrice(instrumentId);

		const previousOrders = await this.getPreviousOrders(userId);

		const instrument = await this.getInstrumentById(instrumentId);

		try {
			this.validateAssets(size, previousOrders);
			const order = new Order({
				instrument,
				userId,
				type,
				side,
				price,
				size,
				status: OrderStatus.FILLED,
				datetime: new Date(),
			});

			await this.orderRepository.save(order);

			return order;
		} catch (error) {
			const order = new Order({
				instrument,
				userId,
				type,
				side,
				price,
				size,
				status: OrderStatus.REJECTED,
				datetime: new Date(),
			});

			await this.orderRepository.save(order);

			throw error;
		}
	}

	validateSize(size: number | undefined): asserts size is number {
		if (typeof size !== 'number' || size <= 0) {
			throw new BadRequestException(
				'Size is required and must be greater than 0',
			);
		}
	}

	validateAssets(size: number, previousOrders: Order[]): void {
		const assetsQuantity =
			this.portfolioService.calculateQuantityAvailableStocks(
				previousOrders,
			);
		if (assetsQuantity < size) {
			throw new BadRequestException(
				'Insufficient assets to process the transaction',
			);
		}
	}

	async getPreviousOrders(userId: number): Promise<Order[]> {
		const previousOrders =
			await this.orderRepository.getOrdersByUserIdAndStatus(
				userId,
				OrderStatus.FILLED,
			);
		return previousOrders;
	}

	async getClosePriceMarketByInstrumentId(
		instrumentId: number,
	): Promise<number | null> {
		const marketData =
			await this.marketDataRepository.getMarketDataByInstrument(
				instrumentId,
			);
		if (!marketData) {
			return null;
		}
		return marketData.getClose();
	}

	async getPrice(instrumentId: number): Promise<number> {
		const price =
			await this.getClosePriceMarketByInstrumentId(instrumentId);

		if (!price) {
			throw new ConflictException(
				`Market price not found for instrument with id ${instrumentId}`,
			);
		}

		return price;
	}

	async getInstrumentById(instrumentId: number): Promise<Instrument> {
		const instrument =
			await this.instrumentRepository.getById(instrumentId);

		if (!instrument) {
			throw new ConflictException(
				`Instrument with id ${instrumentId} not found`,
			);
		}

		if (instrument.getType() !== InstrumentType.STOCK) {
			throw new ConflictException(
				`Instrument with id ${instrumentId} is not a currency`,
			);
		}

		return instrument;
	}
}
