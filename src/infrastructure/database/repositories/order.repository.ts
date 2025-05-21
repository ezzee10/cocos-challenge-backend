import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/domain/models/order.model';
import { Repository } from 'typeorm';

import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { OrderEntity } from '../entities/order.entity';
import { InstrumentEntity } from '../entities/instrument.entity';
import { UserEntity } from '../entities/user.entity';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { Instrument } from 'src/domain/models/instrument.model';

@Injectable()
export class OrderRepository implements IOrderRepository {
	constructor(
		@InjectRepository(OrderEntity)
		private readonly orderRepository: Repository<OrderEntity>,
	) {}

	async save(order: Order): Promise<Order> {
		const orderEntity = this.mapOrderToOrderEntity(order);
		await this.orderRepository.save(orderEntity);
		return this.mapOrderEntityToOrder(orderEntity);
	}

	async getOrdersByUserIdAndStatus(
		userId: number,
		status: OrderStatus,
	): Promise<Order[]> {
		const orderEntities = await this.orderRepository.find({
			where: { user: { id: userId }, status },
			relations: ['instrument', 'user'],
		});

		return orderEntities.map((orderEntity) =>
			this.mapOrderEntityToOrder(orderEntity),
		);
	}

	private mapOrderToOrderEntity(order: Order): OrderEntity {
		const entity = new OrderEntity();

		entity.instrument = this.mapInstrumentToInstrumentEntity(
			order.getInstrument(),
		);
		entity.user = { id: order.getUserId() } as UserEntity;
		entity.size = order.getSize();
		entity.price = order.getPrice();
		entity.side = order.getSide();
		entity.status = order.getStatus();
		entity.type = order.getType();
		entity.datetime = order.getDatetime();

		return entity;
	}

	private mapOrderEntityToOrder(orderEntity: OrderEntity): Order {
		return new Order({
			instrument: this.mapInstrumentEntityToInstrument(
				orderEntity.instrument,
			),
			userId: orderEntity.user.id,
			size: orderEntity.size,
			price: orderEntity.price,
			side: orderEntity.side,
			type: orderEntity.type,
			datetime: orderEntity.datetime,
		});
	}

	private mapInstrumentToInstrumentEntity(
		instrument: Instrument,
	): InstrumentEntity {
		const entity = new InstrumentEntity();
		entity.id = instrument.getId();
		entity.ticker = instrument.getTicker();
		entity.name = instrument.getName();
		entity.type = instrument.getType();
		return entity;
	}

	private mapInstrumentEntityToInstrument(
		entity: InstrumentEntity,
	): Instrument {
		return new Instrument({
			id: entity.id,
			ticker: entity.ticker,
			name: entity.name,
			type: entity.type,
		});
	}
}
