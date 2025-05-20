import {
	BadRequestException,
	ConflictException,
	Injectable,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreateOrderDto } from 'src/presenter/dto/create-order.dto';
import { OrderType } from '../enums/order-type.enum';
import { OrderSide } from '../enums/order-side.enum';
import { Order } from '../models/order.model';
import { Instrument } from '../models/instrument.model';
import { InstrumentType } from '../enums/instrument-type.enum';

@Injectable()
export class OrderValidationService {
	constructor(private readonly portfolioService: PortfolioService) {}

	validateAmountAndSize(dto: CreateOrderDto): void {
		const { amount, size, type, side } = dto;
		if (amount && type !== OrderType.MARKET) {
			throw new BadRequestException(
				'Amount is only allowed for MARKET orders',
			);
		}
		if (
			(amount == undefined && size == undefined) ||
			(amount != undefined && size != undefined)
		) {
			throw new BadRequestException(
				'Provide either amount or size, not both',
			);
		}
		if (
			(side === OrderSide.CASH_IN || side === OrderSide.CASH_OUT) &&
			!size
		)
			throw new BadRequestException(
				'Size is required for cash operations',
			);

		if (
			(side === OrderSide.CASH_IN || side === OrderSide.CASH_OUT) &&
			type !== OrderType.MARKET
		) {
			throw new BadRequestException(
				'Only MARKET orders are allowed for cash operations',
			);
		}
	}

	validateFunds(
		side: OrderSide,
		price: number,
		size: number,
		orders: Order[],
	): void {
		if (side === OrderSide.BUY || side === OrderSide.CASH_OUT) {
			const cash = this.portfolioService.calculateAvailableCash(orders);
			if (cash < price * size)
				throw new ConflictException(
					'Insufficient funds to process the transaction',
				);
		}

		if (side === OrderSide.SELL) {
			const stocks =
				this.portfolioService.calculateQuantityAvailableStocks(orders);
			if (stocks < size)
				throw new ConflictException(
					'Insufficient stocks to process the transaction',
				);
		}
	}

	validateInstrument(instrument: Instrument, side: OrderSide): void {
		if (side === OrderSide.CASH_IN || side === OrderSide.CASH_OUT) {
			if (instrument.getType() !== InstrumentType.CURRENCY) {
				throw new BadRequestException(
					'Only currency instruments can be used for cash operations',
				);
			}
		} else if (instrument.getType() !== InstrumentType.STOCK) {
			throw new BadRequestException(
				'Only stock instruments can be used for stock operations',
			);
		}
	}
}
