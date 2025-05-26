import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketModule } from 'src/market/market.module';
import { InstrumentModule } from 'src/instruments/instrument.module';
import { OrderModule } from 'src/orders/order.module';

import { MarketDataRepository } from 'src/market/infrastructure/database/repositories/market-data.repository';
import { OrderRepository } from 'src/orders/infrastructure/database/repositories/order.repository';

import { PortfolioService } from './domain/services/portfolio.service';
import { CalculatePositionsByOrdersUseCase } from './application/usecases/calculate-positions.usecase';
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
	exports: [GetPortfolioByUserIdUseCase],
})
export class PortfolioModule {}
