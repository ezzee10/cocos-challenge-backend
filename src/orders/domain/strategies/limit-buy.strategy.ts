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

import { IInstrumentRepository } from 'src/instruments/domain/repositories/instrument.repository.interface';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import { InstrumentType } from 'src/instruments/domain/enums/instrument-type.enum';
import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';

@Injectable()
export class LimitBuyStrategy implements OrderCreationStrategy {
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

		const orders = await this.orderRepository.getOrders({
			userId,
			status: OrderStatus.FILLED,
			instrumentId,
		});

		const currentCash =
			this.portfolioService.calculateAvailableCash(orders);

		const totalAmountOrder = price * size;

		const hasSufficientFunds = currentCash >= totalAmountOrder;

		const status = hasSufficientFunds
			? OrderStatus.NEW
			: OrderStatus.REJECTED;

		const order = new Order({
			instrument,
			userId,
			type,
			side,
			price,
			size,
			status: status,
			datetime: new Date(),
		});

		await this.orderRepository.save(order);

		if (!hasSufficientFunds) {
			throw new ConflictException(
				'Insufficient funds to process the transaction',
			);
		}

		return order;
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
