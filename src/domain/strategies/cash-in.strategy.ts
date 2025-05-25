import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
} from '@nestjs/common';
import { OrderCreationStrategy } from './order.strategy';
import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { Order } from '../models/order.model';
import { IOrderRepository } from '../repositories/order.repository.interface';
import { IInstrumentRepository } from '../repositories/instrument.repository.interface';
import { Instrument } from '../models/instrument.model';
import { InstrumentType } from '../enums/instrument-type.enum';

@Injectable()
export class CashInStrategy implements OrderCreationStrategy {
	constructor(
		@Inject('IOrderRepository')
		private readonly orderRepository: IOrderRepository,

		@Inject('IInstrumentRepository')
		private readonly instrumentRepository: IInstrumentRepository,
	) {}

	static PRICE_CASH_IN = 1;

	async create(dto: CreateOrderDto): Promise<Order> {
		const { instrumentId, userId, type, side, size } = dto;

		this.validateSize(size);

		const price = CashInStrategy.PRICE_CASH_IN;

		const instrument = await this.getInstrumentById(instrumentId);

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

		return await this.orderRepository.save(order);
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

		if (instrument.getType() !== InstrumentType.CURRENCY) {
			throw new ConflictException(
				`Instrument with id ${instrumentId} is not a currency`,
			);
		}

		return instrument;
	}
}
