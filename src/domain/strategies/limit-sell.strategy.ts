import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
} from '@nestjs/common';
import { PortfolioService } from '../services/portfolio.service';
import { OrderCreationStrategy } from './order.strategy';
import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { Order } from '../models/order.model';
import { IOrderRepository } from '../repositories/order.repository.interface';
import { IInstrumentRepository } from '../repositories/instrument.repository.interface';
import { Instrument } from '../models/instrument.model';
import { InstrumentType } from '../enums/instrument-type.enum';

@Injectable()
export class LimitSellStrategy implements OrderCreationStrategy {
	constructor(
		@Inject('IOrderRepository')
		private readonly orderRepository: IOrderRepository,

		private readonly portfolioService: PortfolioService,

		@Inject('IInstrumentRepository')
		private readonly instrumentRepository: IInstrumentRepository,
	) {}

	async create(dto: CreateOrderDto): Promise<Order> {
		const { instrumentId, userId, type, side, price, size } = dto;

		this.validateSize(size);

		this.validatePrice(price);

		const instrument = await this.getInstrumentById(instrumentId);

		const previousOrders = await this.getPreviousOrders(userId);

		try {
			this.validateAssets(size, previousOrders);
			const order = new Order({
				instrument,
				userId,
				type,
				side,
				price,
				size,
				status: OrderStatus.NEW,
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

	validatePrice(price: number | undefined): asserts price is number {
		if (typeof price !== 'number' || price <= 0) {
			throw new BadRequestException(
				'Price is required and must be greater than 0',
			);
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
			throw new ConflictException(
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
