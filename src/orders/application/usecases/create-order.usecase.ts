import { Injectable } from '@nestjs/common';
import { Order } from 'src/orders/domain/models/order.model';
import { CreateOrderDto } from 'src/orders/presenter/dto/create-order.dto';
import { OrderCreateStrategyFactory } from 'src/orders/domain/factories/create-order.factory';

@Injectable()
export class CreateOrderUseCase {
	constructor(
		private readonly orderCreateStrategyFactory: OrderCreateStrategyFactory,
	) {}

	async execute(createOrderDto: CreateOrderDto): Promise<Order> {
		const order = await this.orderCreateStrategyFactory
			.getStrategy(createOrderDto.type, createOrderDto.side)
			.create(createOrderDto);

		return order;
	}
}
