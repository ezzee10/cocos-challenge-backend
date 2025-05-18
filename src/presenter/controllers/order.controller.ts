import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateOrderUseCase } from 'src/application/usecases/create-order.usecase';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
	CreateOrderResponseDto,
	mapOrderToCreateOrderResponseDto,
} from '../dto/responses/create-order-response.dto';

@Controller('orders')
export class OrderController {
	constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createOrder(
		@Body() createOrderDto: CreateOrderDto,
	): Promise<CreateOrderResponseDto> {
		const order = await this.createOrderUseCase.execute(createOrderDto);
		return mapOrderToCreateOrderResponseDto(order);
	}
}
