import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';
import { Order } from '../models/order.model';

export interface OrderCreationStrategy {
	create(dto: CreateOrderDto): Promise<Order>;
}
