import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './infrastructure/database/entities/order.entity';
import { UserEntity } from './infrastructure/database/entities/user.entity';
import { InstrumentEntity } from './infrastructure/database/entities/instrument.entity';
import { OrderController } from './presenter/controllers/order.controller';
import { CreateOrderUseCase } from './application/usecases/create-order.usecase';
import { MarketDataEntity } from './infrastructure/database/entities/market-data.entity';
import { OrderRepository } from './infrastructure/database/repositories/order.repository';
import { MarketDataRepository } from './infrastructure/database/repositories/market-data.repository';
import { IInstrumentRepository } from './domain/repositories/instrument.repository.interface';
import { InstrumentRepository } from './infrastructure/database/repositories/instrument.repository';
import { PortfolioService } from './domain/services/portfolio.service';
import { InstrumentController } from './presenter/controllers/instrument.controller';
import { SearchInstrumentsUseCase } from './application/usecases/search-instruments.usecase';
import { CalculatePositionsByOrdersUseCase } from './application/usecases/calculate-positions.usecase';
import { PortfolioController } from './presenter/controllers/portfolio.controller';
import { GetPortfolioByUserIdUseCase } from './application/usecases/get-portfolio.usecase';
import { OrderValidationService } from './domain/services/order-validation.service';
import { CancelOrderUseCase } from './application/usecases/cancel-order.usecase';

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
		OrderRepository,
		MarketDataRepository,
		InstrumentRepository,
		PortfolioService,
		OrderValidationService,
		{
			provide: CreateOrderUseCase,
			useFactory: (
				orderRepository: OrderRepository,
				marketDataRepository: MarketDataRepository,
				instrumentRepository: IInstrumentRepository,
				orderValidationService: OrderValidationService,
			) =>
				new CreateOrderUseCase(
					orderRepository,
					marketDataRepository,
					instrumentRepository,
					orderValidationService,
				),
			inject: [
				OrderRepository,
				MarketDataRepository,
				InstrumentRepository,
				OrderValidationService,
			],
		},
		{
			provide: SearchInstrumentsUseCase,
			useFactory: (instrumentRepository: InstrumentRepository) => {
				return new SearchInstrumentsUseCase(instrumentRepository);
			},
			inject: [InstrumentRepository],
		},
		{
			provide: CalculatePositionsByOrdersUseCase,
			useFactory: (marketDataRepository: MarketDataRepository) => {
				return new CalculatePositionsByOrdersUseCase(
					marketDataRepository,
				);
			},
			inject: [MarketDataRepository],
		},
		{
			provide: GetPortfolioByUserIdUseCase,
			useFactory: (
				orderRepository: OrderRepository,
				calculatePositionsByOrdersUseCase: CalculatePositionsByOrdersUseCase,
				portfolioService: PortfolioService,
			) => {
				return new GetPortfolioByUserIdUseCase(
					orderRepository,
					calculatePositionsByOrdersUseCase,
					portfolioService,
				);
			},
			inject: [
				OrderRepository,
				CalculatePositionsByOrdersUseCase,
				PortfolioService,
			],
		},
		{
			provide: OrderValidationService,
			useFactory: (portfolioService: PortfolioService) => {
				return new OrderValidationService(portfolioService);
			},
			inject: [PortfolioService],
		},
		{
			provide: CancelOrderUseCase,
			useFactory: (orderRepository: OrderRepository) => {
				return new CancelOrderUseCase(orderRepository);
			},
			inject: [OrderRepository],
		},
	],
})
export class AppModule {}
