import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateOrderUseCase } from 'src/orders/application/usecases/create-order.usecase';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
	CreateOrderResponseDto,
	mapOrderToCreateOrderResponseDto,
} from '../dto/responses/create-order-response.dto';
import { CancelOrderUseCase } from 'src/orders/application/usecases/cancel-order.usecase';

@Controller('orders')
export class OrderController {
	constructor(
		private readonly createOrderUseCase: CreateOrderUseCase,
		private readonly cancelOrderUseCase: CancelOrderUseCase,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createOrder(
		@Body() createOrderDto: CreateOrderDto,
	): Promise<CreateOrderResponseDto> {
		const order = await this.createOrderUseCase.execute(createOrderDto);
		return mapOrderToCreateOrderResponseDto(order);
	}

	@Patch(':id/cancel')
	@HttpCode(HttpStatus.OK)
	async cancelOrder(
		@Param('id') id: string,
	): Promise<CreateOrderResponseDto> {
		if (!id) {
			throw new BadRequestException('Id parameter is required');
		}

		const order = await this.cancelOrderUseCase.execute(id);
		return mapOrderToCreateOrderResponseDto(order);
	}
}
