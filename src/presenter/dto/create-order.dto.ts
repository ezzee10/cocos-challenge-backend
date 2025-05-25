import {
	IsDefined,
	IsEnum,
	IsInt,
	IsOptional,
	IsPositive,
	Min,
	ValidateIf,
} from 'class-validator';
import { OrderType } from 'src/domain/enums/order-type.enum';
import { OrderSide } from 'src/domain/enums/order-side.enum';

export class CreateOrderDto {
	@IsInt()
	@IsPositive()
	instrumentId!: number;

	@IsInt()
	@IsPositive()
	userId!: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	size?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	amount?: number;

	@ValidateIf((o: CreateOrderDto) => o.type === OrderType.LIMIT)
	@IsDefined({ message: 'Price is required for LIMIT orders.' })
	@Min(1)
	price?: number;

	@IsEnum(OrderSide)
	side!: OrderSide;

	@IsEnum(OrderType)
	type!: OrderType;
}
