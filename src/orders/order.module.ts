import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './infrastructure/database/entities/order.entity';
import { OrderController } from './presenter/controllers/order.controller';
import { OrderRepository } from './infrastructure/database/repositories/order.repository';

import { CreateOrderUseCase } from './application/usecases/create-order.usecase';
import { CancelOrderUseCase } from './application/usecases/cancel-order.usecase';

import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';

import { MarketBuyStrategy } from './domain/strategies/market-buy.strategy';
import { MarketSellStrategy } from './domain/strategies/market-sell.strategy';
import { CashOutStrategy } from './domain/strategies/cash.out.strategy';
import { CashInStrategy } from './domain/strategies/cash-in.strategy';
import { LimitBuyStrategy } from './domain/strategies/limit-buy.strategy';
import { LimitSellStrategy } from './domain/strategies/limit-sell.strategy';

import { OrderCreateStrategyFactory } from './domain/factories/create-order.factory';
import { IOrderRepository } from './domain/repositories/order.repository.interface';
import { MarketDataEntity } from 'src/market/infrastructure/database/entities/market-data.entity';
import { MarketModule } from 'src/market/market.module';
import { InstrumentEntity } from 'src/instruments/infrastructure/database/entities/instrument.entity';
import { InstrumentModule } from 'src/instruments/instrument.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			OrderEntity,
			MarketDataEntity,
			InstrumentEntity,
		]),
		MarketModule,
		InstrumentModule,
	],
	controllers: [OrderController],
	providers: [
		{ provide: 'IOrderRepository', useClass: OrderRepository },
		MarketBuyStrategy,
		MarketSellStrategy,
		CashOutStrategy,
		CashInStrategy,
		LimitBuyStrategy,
		LimitSellStrategy,
		PortfolioService,
		{
			provide: OrderCreateStrategyFactory,
			useFactory: (
				marketBuy: MarketBuyStrategy,
				marketSell: MarketSellStrategy,
				cashOut: CashOutStrategy,
				cashIn: CashInStrategy,
				limitBuy: LimitBuyStrategy,
				limitSell: LimitSellStrategy,
			) =>
				new OrderCreateStrategyFactory(
					marketBuy,
					marketSell,
					cashOut,
					cashIn,
					limitBuy,
					limitSell,
				),
			inject: [
				MarketBuyStrategy,
				MarketSellStrategy,
				CashOutStrategy,
				CashInStrategy,
				LimitBuyStrategy,
				LimitSellStrategy,
			],
		},

		{
			provide: CreateOrderUseCase,
			useFactory: (strategyFactory: OrderCreateStrategyFactory) =>
				new CreateOrderUseCase(strategyFactory),
			inject: [OrderCreateStrategyFactory],
		},
		{
			provide: CancelOrderUseCase,
			useFactory: (orderRepository: IOrderRepository) =>
				new CancelOrderUseCase(orderRepository),
			inject: ['IOrderRepository'],
		},
	],
	exports: [
		CreateOrderUseCase,
		CancelOrderUseCase,
		{ provide: 'IOrderRepository', useClass: OrderRepository },
	],
})
export class OrderModule {}
