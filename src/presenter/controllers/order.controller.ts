import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateOrderUseCase } from 'src/application/create-order.usecase';
import { Order } from 'src/domain/models/order.model';
import { CreateOrderDto } from '../dto/create-order.dto';

@Controller('orders')
export class OrderController {
	constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createOrder(
		@Body() createOrderDto: CreateOrderDto,
	): Promise<Order | null> {
		const order = await this.createOrderUseCase.execute(createOrderDto);
		return order;
	}
}
