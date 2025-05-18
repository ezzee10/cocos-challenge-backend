import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';
import { InstrumentType } from '../enums/instrument-type.enum';
import { OrderSide } from '../enums/order-side.enum';

@Injectable()
export class PortfolioService {
	calculateAvailableCash(orders: Order[]): number {
		let cash = 0;

		for (const order of orders) {
			const instrument = order.getInstrument();
			const type = instrument.getType();
			const side = order.getSide();
			const price = order.getPrice();
			const size = order.getSize();

			if (type === InstrumentType.STOCK) {
				if (side === OrderSide.BUY) {
					cash -= price * size;
				} else if (side === OrderSide.SELL) {
					cash += price * size;
				}
			} else if (type === InstrumentType.CURRENCY) {
				if (side === OrderSide.CASH_IN) {
					cash += size;
				} else if (side === OrderSide.CASH_OUT) {
					cash -= size;
				}
			}
		}

		return cash;
	}

	calculateQuantityAvailableStocks(orders: Order[]): number {
		let stocks = 0;

		for (const order of orders) {
			const instrument = order.getInstrument();

			if (instrument.getType() === InstrumentType.STOCK) {
				if (order.getSide() === OrderSide.BUY) {
					stocks += order.getSize();
				} else if (order.getSide() === OrderSide.SELL) {
					stocks -= order.getSize();
				}
			}
		}

		return stocks;
	}
}
