import { Order } from '../models/order.model';

export interface IOrderRepository {
	save(order: Order): Promise<Order>;
}
