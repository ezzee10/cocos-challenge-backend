import { CreateOrderDto } from 'src/orders/presenter/dto/create-order.dto';
import { Order } from '../models/order.model';

export interface OrderCreationStrategy {
	create(dto: CreateOrderDto): Promise<Order>;
}
