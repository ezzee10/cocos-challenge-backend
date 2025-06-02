import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/domain/models/order.model';
import { FindOptionsWhere, Repository } from 'typeorm';

import {
	GetOrdersFilters,
	IOrderRepository,
} from 'src/orders/domain/repositories/order.repository.interface';
import { OrderEntity } from '../entities/order.entity';
import { Optional } from 'src/common/utils/utils';
import { UserEntity } from 'src/users/infrastructure/database/entities/user.entity';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import { InstrumentEntity } from 'src/instruments/infrastructure/database/entities/instrument.entity';

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

	async getOrders(filters: GetOrdersFilters): Promise<Order[]> {
		const where: FindOptionsWhere<OrderEntity> = {};

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.instrumentId) {
			where.instrument = { id: filters.instrumentId };
		}

		if (filters.userId) {
			where.user = { id: filters.userId };
		}

		const orderEntities = await this.orderRepository.find({
			where,
			relations: ['instrument', 'user'],
		});

		return orderEntities.map((entity) =>
			this.mapOrderEntityToOrder(entity),
		);
	}

	async findById(orderId: string): Promise<Optional<Order>> {
		const orderEntity = await this.orderRepository.findOne({
			where: { id: Number(orderId) },
			relations: ['instrument', 'user'],
		});
		return orderEntity ? this.mapOrderEntityToOrder(orderEntity) : null;
	}

	private mapOrderToOrderEntity(order: Order): OrderEntity {
		const entity = new OrderEntity();

		entity.id = order.getId() as number;

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
			id: orderEntity.id,
			instrument: this.mapInstrumentEntityToInstrument(
				orderEntity.instrument,
			),
			userId: orderEntity.user.id,
			size: orderEntity.size,
			price: orderEntity.price,
			side: orderEntity.side,
			type: orderEntity.type,
			status: orderEntity.status,
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
