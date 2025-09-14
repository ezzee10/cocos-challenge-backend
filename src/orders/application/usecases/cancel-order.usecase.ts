import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { OrderStatus } from 'src/orders/domain/enums/order-status.enum';
import { OrderType } from 'src/orders/domain/enums/order-type.enum';
import { Order } from 'src/orders/domain/models/order.model';
import { IOrderRepository } from 'src/orders/domain/repositories/order.repository.interface';

export class CancelOrderUseCase {
	constructor(
		@Inject('IOrderRepository')
		private readonly orderRepository: IOrderRepository,
	) {}

	async execute(orderId: string): Promise<Order> {
		const order = await this.orderRepository.findById(orderId);
		if (!order) {
			throw new NotFoundException(`Order with id ${orderId} not found`);
		}

		if (order.getStatus() === OrderStatus.CANCELLED) {
			return order;
		}

		const isCancelable =
			order.getStatus() === OrderStatus.NEW &&
			order.getType() === OrderType.LIMIT;

		if (!isCancelable) {
			throw new ConflictException(
				`Only orders in ${OrderStatus.NEW} status and of type ${OrderType.LIMIT} can be canceled`,
			);
		}

		order.cancelOrder();
		await this.orderRepository.save(order);
		return order;
	}
}
