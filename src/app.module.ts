import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './infrastructure/database/entities/order.entity';
import { UserEntity } from './infrastructure/database/entities/user.entity';
import { InstrumentEntity } from './infrastructure/database/entities/instrument.entity';
import { MarketDataEntity } from './infrastructure/database/entities/market-data.entity';

import { OrderController } from './presenter/controllers/order.controller';
import { InstrumentController } from './presenter/controllers/instrument.controller';
import { PortfolioController } from './presenter/controllers/portfolio.controller';

import { CreateOrderUseCase } from './application/usecases/create-order.usecase';
import { CancelOrderUseCase } from './application/usecases/cancel-order.usecase';
import { SearchInstrumentsUseCase } from './application/usecases/search-instruments.usecase';
import { CalculatePositionsByOrdersUseCase } from './application/usecases/calculate-positions.usecase';
import { GetPortfolioByUserIdUseCase } from './application/usecases/get-portfolio.usecase';

import { OrderRepository } from './infrastructure/database/repositories/order.repository';
import { MarketDataRepository } from './infrastructure/database/repositories/market-data.repository';
import { InstrumentRepository } from './infrastructure/database/repositories/instrument.repository';

import { PortfolioService } from './domain/services/portfolio.service';
import { OrderValidationService } from './domain/services/order-validation.service';
import { OrderCreateStrategyFactory } from './domain/factories/create-order.factory';
import { MarketBuyStrategy } from './domain/strategies/market-buy.strategy';
import { MarketSellStrategy } from './domain/strategies/market-sell.strategy';
import { CashOutStrategy } from './domain/strategies/cash.out.strategy';
import { CashInStrategy } from './domain/strategies/cash-in.strategy';
import { LimitBuyStrategy } from './domain/strategies/limit-buy.strategy';
import { LimitSellStrategy } from './domain/strategies/limit-sell.strategy';
import { IOrderRepository } from './domain/repositories/order.repository.interface';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
		}),
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: 'postgres',
				host: process.env.DB_HOST,
				port: parseInt(process.env.DB_PORT || '5432', 10),
				username: process.env.DB_USERNAME,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_NAME,
				entities: [
					OrderEntity,
					InstrumentEntity,
					UserEntity,
					MarketDataEntity,
				],
				synchronize: false,
				ssl: process.env.DB_SSL === 'true',
			}),
		}),
		TypeOrmModule.forFeature([
			OrderEntity,
			InstrumentEntity,
			UserEntity,
			MarketDataEntity,
		]),
	],
	controllers: [OrderController, InstrumentController, PortfolioController],
	providers: [
		{ provide: 'IOrderRepository', useClass: OrderRepository },
		{ provide: 'IMarketRepository', useClass: MarketDataRepository },
		{ provide: 'IInstrumentRepository', useClass: InstrumentRepository },
		PortfolioService,
		OrderValidationService,
		MarketBuyStrategy,
		MarketSellStrategy,
		CashOutStrategy,
		CashInStrategy,
		LimitBuyStrategy,
		LimitSellStrategy,
		{
			provide: OrderCreateStrategyFactory,
			useFactory: (
				martketBuyStrategy: MarketBuyStrategy,
				marketSellStrategy: MarketSellStrategy,
				cashOutStrategy: CashOutStrategy,
				cashInStrategy: CashInStrategy,
				limitBuyStrategy: LimitBuyStrategy,
				limitSellStrategy: LimitSellStrategy,
			) =>
				new OrderCreateStrategyFactory(
					martketBuyStrategy,
					marketSellStrategy,
					cashOutStrategy,
					cashInStrategy,
					limitBuyStrategy,
					limitSellStrategy,
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
		{
			provide: SearchInstrumentsUseCase,
			useFactory: (instrumentRepository: InstrumentRepository) =>
				new SearchInstrumentsUseCase(instrumentRepository),
			inject: ['IInstrumentRepository'],
		},
		{
			provide: CalculatePositionsByOrdersUseCase,
			useFactory: (marketDataRepository: MarketDataRepository) =>
				new CalculatePositionsByOrdersUseCase(marketDataRepository),
			inject: ['IMarketRepository'],
		},
		{
			provide: GetPortfolioByUserIdUseCase,
			useFactory: (
				orderRepository: OrderRepository,
				calculatePositions: CalculatePositionsByOrdersUseCase,
				portfolioService: PortfolioService,
			) =>
				new GetPortfolioByUserIdUseCase(
					orderRepository,
					calculatePositions,
					portfolioService,
				),
			inject: [
				'IOrderRepository',
				CalculatePositionsByOrdersUseCase,
				PortfolioService,
			],
		},
	],
})
export class AppModule {}
