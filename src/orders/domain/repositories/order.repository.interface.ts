import { Optional } from 'src/common/utils/utils';
import { Order } from '../models/order.model';
import { OrderStatus } from '../enums/order-status.enum';

export interface GetOrdersFilters {
	status?: OrderStatus;
	instrumentId?: number;
	userId?: number;
}

export interface IOrderRepository {
	save(order: Order): Promise<Order>;
	findById(orderId: string): Promise<Optional<Order>>;
	getOrders(filters: GetOrdersFilters): Promise<Order[]>;
}
