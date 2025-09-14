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
import { IMarketRepository } from '../../../market/domain/repositories/market-data.repository.interface';
import { IInstrumentRepository } from 'src/instruments/domain/repositories/instrument.repository.interface';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import { InstrumentType } from 'src/instruments/domain/enums/instrument-type.enum';
import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';

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

		const instrument = await this.getInstrumentById(instrumentId);

		const price = await this.getPrice(instrumentId);

		const finalSize = this.calculateFinalSize({
			amount,
			price,
			size,
		});

		const orders = await this.orderRepository.getOrders({
			userId,
			status: OrderStatus.FILLED,
		});

		const totalAmountOrder = price * finalSize;
		const currentCash =
			this.portfolioService.calculateAvailableCash(orders);

		const hasSufficientFunds = currentCash >= totalAmountOrder;

		const status = hasSufficientFunds
			? OrderStatus.FILLED
			: OrderStatus.REJECTED;

		const order = new Order({
			instrument,
			userId,
			type,
			side,
			price,
			size: finalSize,
			status: status,
			datetime: new Date(),
		});

		await this.orderRepository.save(order);

		if (!hasSufficientFunds) {
			throw new BadRequestException(
				'Insufficient funds to process the transaction',
			);
		}

		return order;
	}

	validateSize(size?: number, amount?: number): void {
		const hasSize = size != null;
		const hasAmount = amount != null;

		if (hasSize && hasAmount) {
			throw new BadRequestException(
				'Size and amount cannot both be defined',
			);
		}

		if (!hasSize && !hasAmount) {
			throw new BadRequestException(
				'Either size or amount must be defined',
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
				`Instrument with id ${instrumentId} is not a stock`,
			);
		}

		return instrument;
	}
}
