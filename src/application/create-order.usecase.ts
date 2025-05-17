import { Injectable } from '@nestjs/common';
import { Order } from 'src/domain/models/order.model';
import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
	constructor() {}

	async execute(createOrderDto: CreateOrderDto): Promise<Order | null> {
		return null;
	}
}
