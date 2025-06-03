import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketModule } from 'src/market/market.module';
import { InstrumentModule } from 'src/instruments/instrument.module';
import { OrderModule } from 'src/orders/order.module';

import { MarketDataRepository } from 'src/market/infrastructure/database/repositories/market-data.repository';
import { OrderRepository } from 'src/orders/infrastructure/database/repositories/order.repository';

import { PortfolioService } from './domain/services/portfolio.service';
import { CreatePositionsByOrdersUseCase } from './application/usecases/create-positions.usecase';
import { GetPortfolioByUserIdUseCase } from './application/usecases/get-portfolio.usecase';
import { PortfolioController } from './presenter/controllers/portfolio.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([]),
		MarketModule,
		InstrumentModule,
		OrderModule,
	],
	controllers: [PortfolioController],
	providers: [
		PortfolioService,
		{
			provide: CreatePositionsByOrdersUseCase,
			useFactory: (marketDataRepository: MarketDataRepository) =>
				new CreatePositionsByOrdersUseCase(marketDataRepository),
			inject: ['IMarketRepository'],
		},
		{
			provide: GetPortfolioByUserIdUseCase,
			useFactory: (
				orderRepository: OrderRepository,
				createtePositions: CreatePositionsByOrdersUseCase,
				portfolioService: PortfolioService,
			) =>
				new GetPortfolioByUserIdUseCase(
					orderRepository,
					createtePositions,
					portfolioService,
				),
			inject: [
				'IOrderRepository',
				CreatePositionsByOrdersUseCase,
				PortfolioService,
			],
		},
	],
	exports: [GetPortfolioByUserIdUseCase],
})
export class PortfolioModule {}
