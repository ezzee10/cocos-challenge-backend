import { ConflictException, Injectable } from '@nestjs/common';
import { OrderType } from 'src/domain/enums/order-type.enum';
import { OrderSide } from 'src/domain/enums/order-side.enum';
import { Order } from 'src/domain/models/order.model';
import { MarketData } from 'src/domain/models/market-data.model';
import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';
import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { IMarketRepository } from 'src/domain/repositories/market-data.repository.interface';
import { Instrument } from 'src/domain/models/instrument.model';
import { IInstrumentRepository } from 'src/domain/repositories/instrument.repository.interface';

@Injectable()
export class CreateOrderUseCase {
	constructor(
		private readonly orderRepository: IOrderRepository,
		private readonly marketDataRepository: IMarketRepository,
		private readonly instrumentRepository: IInstrumentRepository,
	) {}

	async execute(createOrderDto: CreateOrderDto): Promise<Order> {
		const { instrumentId, userId, type, side, size, price } =
			createOrderDto;

		const finalPrice = await this.calculateFinalPrice(
			type,
			side,
			instrumentId,
			price,
		);

		const instrument = await this.getInstrument(instrumentId);

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

	private async getInstrument(instrumentId: number): Promise<Instrument> {
		const instrument =
			await this.instrumentRepository.getById(instrumentId);

		if (!instrument) {
			throw new ConflictException(
				`Instrument with id ${instrumentId} not found`,
			);
		}

		return instrument;
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
