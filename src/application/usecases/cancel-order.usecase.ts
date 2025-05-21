import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { OrderType } from 'src/domain/enums/order-type.enum';
import { Order } from 'src/domain/models/order.model';
import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';

export class CancelOrderUseCase {
	constructor(private readonly orderRepository: IOrderRepository) {}

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
