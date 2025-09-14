import { OrderSide } from 'src/orders/domain/enums/order-side.enum';
import { OrderStatus } from 'src/orders/domain/enums/order-status.enum';
import { OrderType } from 'src/orders/domain/enums/order-type.enum';
import { Order } from 'src/orders/domain/models/order.model';

export interface CreateOrderResponseDto {
	id: number;
	userId: number;
	instrumentId: number;
	size: number;
	price: number;
	type: OrderType;
	side: OrderSide;
	status: OrderStatus;
}

export function mapOrderToCreateOrderResponseDto(
	order: Order,
): CreateOrderResponseDto {
	return {
		id: order.getId() as number,
		userId: order.getUserId(),
		instrumentId: order.getInstrument().getId(),
		size: order.getSize(),
		price: order.getPrice(),
		type: order.getType(),
		side: order.getSide(),
		status: order.getStatus(),
	};
}
