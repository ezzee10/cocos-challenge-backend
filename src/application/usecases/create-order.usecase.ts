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
import { OrderValidationService } from 'src/domain/services/order-validation.service';

@Injectable()
export class CreateOrderUseCase {
	constructor(
		private readonly orderRepository: IOrderRepository,
		private readonly marketDataRepository: IMarketRepository,
		private readonly instrumentRepository: IInstrumentRepository,
		private readonly orderValidationService: OrderValidationService,
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

		this.orderValidationService.validateAmountAndSize(createOrderDto);

		const instrument = await this.getInstrumentById(instrumentId);

		this.orderValidationService.validateInstrument(instrument, side);

		const finalPrice = await this.calculateFinalPrice(
			type,
			side,
			instrumentId,
			price,
		);

		const size = this.calculateFinalSize(amount, inputSize, finalPrice);

		const previousOrders = await this.getPreviousOrders(
			userId,
			OrderStatus.FILLED,
		);

		try {
			this.orderValidationService.validateFunds(
				side,
				finalPrice,
				size,
				previousOrders,
			);
		} catch (error) {
			await this.rejectAndThrowOrder(
				instrument,
				userId,
				size,
				finalPrice,
				type,
				side,
				error,
			);
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

	private calculateFinalSize(
		amount?: number,
		size?: number,
		price?: number,
	): number {
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

	private async rejectAndThrowOrder(
		instrument: Instrument,
		userId: number,
		size: number,
		price: number,
		type: OrderType,
		side: OrderSide,
		error: unknown,
	): Promise<never> {
		const rejectedOrder = new Order({
			instrument,
			userId,
			size,
			price,
			type,
			side,
			datetime: new Date(),
		});

		rejectedOrder.rejectOrder();
		await this.orderRepository.save(rejectedOrder);

		throw error;
	}

	private async getInstrumentById(instrumentId: number): Promise<Instrument> {
		const instrument =
			await this.instrumentRepository.getById(instrumentId);
		if (!instrument)
			throw new ConflictException(
				`Instrument with id ${instrumentId} not found`,
			);
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
