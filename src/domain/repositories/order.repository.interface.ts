import { Optional } from 'src/utils/utils';
import { Order } from '../models/order.model';

export interface IOrderRepository {
	save(order: Order): Promise<Order>;
	getOrdersByUserIdAndStatus(
		userId: number,
		status: string,
	): Promise<Order[]>;
	findById(orderId: string): Promise<Optional<Order>>;
}
