import { Injectable } from '@nestjs/common';
import { MarketBuyStrategy } from '../strategies/market-buy.strategy';
import { MarketSellStrategy } from '../strategies/market-sell.strategy';
import { CashOutStrategy } from '../strategies/cash.out.strategy';
import { CashInStrategy } from '../strategies/cash-in.strategy';
import { LimitBuyStrategy } from '../strategies/limit-buy.strategy';
import { LimitSellStrategy } from '../strategies/limit-sell.strategy';
import { OrderCreationStrategy } from '../strategies/order.strategy';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '../enums/order-type.enum';

@Injectable()
export class OrderCreateStrategyFactory {
	constructor(
		private readonly martketBuyStrategy: MarketBuyStrategy,
		private readonly marketSellStrategy: MarketSellStrategy,
		private readonly cashOutStrategy: CashOutStrategy,
		private readonly cashInStrategy: CashInStrategy,
		private readonly limitBuyStrategy: LimitBuyStrategy,
		private readonly limitSellStrategy: LimitSellStrategy,
	) {}

	getStrategy(type: OrderType, side: OrderSide): OrderCreationStrategy {
		if (type === OrderType.MARKET && side === OrderSide.BUY)
			return this.martketBuyStrategy;

		if (type === OrderType.MARKET && side === OrderSide.SELL)
			return this.marketSellStrategy;

		if (type === OrderType.MARKET && side === OrderSide.CASH_OUT)
			return this.cashOutStrategy;

		if (type === OrderType.MARKET && side === OrderSide.CASH_IN)
			return this.cashInStrategy;

		if (type === OrderType.LIMIT && side === OrderSide.BUY)
			return this.limitBuyStrategy;

		if (type === OrderType.LIMIT && side === OrderSide.SELL)
			return this.limitSellStrategy;

		throw new Error(`No strategy for type: ${type}, side: ${side}`);
	}
}
