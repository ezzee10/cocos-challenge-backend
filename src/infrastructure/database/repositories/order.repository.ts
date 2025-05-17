import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/domain/models/order.model';
import { Repository } from 'typeorm';

import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
	constructor(
		@InjectRepository(OrderEntity)
		private readonly orderRepository: Repository<OrderEntity>,
	) {}
	save(order: Order): Promise<Order> {
		throw new Error('Method not implemented.');
	}
}
