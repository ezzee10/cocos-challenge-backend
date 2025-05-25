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
import { IMarketRepository } from '../repositories/market-data.repository.interface';
import { IInstrumentRepository } from '../repositories/instrument.repository.interface';
import { Instrument } from '../models/instrument.model';
import { InstrumentType } from '../enums/instrument-type.enum';

@Injectable()
export class MarketBuyStrategy implements OrderCreationStrategy {
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
		const { instrumentId, userId, type, side, size, amount } = dto;

		this.validateSize(dto.size, dto.amount);

		const price = await this.getPrice(instrumentId);

		const finalSize = this.calculateFinalSize({
			amount,
			price,
			size,
		});

		const instrument = await this.getInstrumentById(instrumentId);

		const previousOrders = await this.getPreviousOrders(userId);

		try {
			this.validateFunds(price, finalSize, previousOrders);
			const order = new Order({
				instrument,
				userId,
				type,
				side,
				price,
				size: finalSize,
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
				size: finalSize,
				status: OrderStatus.REJECTED,
				datetime: new Date(),
			});

			await this.orderRepository.save(order);

			throw error;
		}
	}

	validateSize(size?: number, amount?: number): void {
		const hasSize = size != null;
		const hasAmount = amount != null;

		if (hasSize && hasAmount) {
			throw new Error('Size and amount cannot both be defined');
		}

		if (!hasSize && !hasAmount) {
			throw new Error('Either size or amount must be defined');
		}
	}

	validateFunds(price: number, size: number, previousOrders: Order[]): void {
		const cash =
			this.portfolioService.calculateAvailableCash(previousOrders);
		if (cash < price * size) {
			throw new BadRequestException(
				'Insufficient funds to process the transaction',
			);
		}
	}

	calculateFinalSize(params: {
		amount?: number;
		price: number;
		size?: number;
	}): number {
		const { amount, price, size } = params;

		const hasAmount = amount != null;
		const hasSize = size != null;

		if (hasAmount && hasSize) {
			throw new BadRequestException(
				'Provide either size or amount, not both',
			);
		}

		if (hasAmount) {
			return Math.floor(amount / price);
		}

		if (hasSize) {
			return size;
		}

		throw new BadRequestException(
			'Missing parameters: either size or amount is required',
		);
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
