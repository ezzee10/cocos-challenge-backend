import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/domain/models/order.model';
import { Repository } from 'typeorm';

import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { OrderEntity } from '../entities/order.entity';
import { InstrumentEntity } from '../entities/instrument.entity';
import { UserEntity } from '../entities/user.entity';

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

	private mapOrderEntityToOrder(orderEntity: OrderEntity): Order {
		return new Order({
			instrumentId: orderEntity.instrument.id,
			userId: orderEntity.user.id,
			size: orderEntity.size,
			price: orderEntity.price,
			side: orderEntity.side,
			type: orderEntity.type,
			datetime: orderEntity.datetime,
		});
	}

	private mapOrderToOrderEntity(order: Order): OrderEntity {
		const entity = new OrderEntity();

		entity.instrument = { id: order.getInstrumentId() } as InstrumentEntity;
		entity.user = { id: order.getUserId() } as UserEntity;
		entity.size = order.getSize();
		entity.price = order.getPrice();
		entity.side = order.getSide();
		entity.status = order.getStatus();
		entity.type = order.getType();
		entity.datetime = order.getDatetime();

		return entity;
	}
}
