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

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
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
			}),
		}),
		TypeOrmModule.forFeature([
			OrderEntity,
			InstrumentEntity,
			UserEntity,
			MarketDataEntity,
		]),
	],
	controllers: [OrderController, InstrumentController],
	providers: [
		OrderRepository,
		MarketDataRepository,
		InstrumentRepository,
		PortfolioService,
		{
			provide: CreateOrderUseCase,
			useFactory: (
				orderRepository: OrderRepository,
				marketDataRepository: MarketDataRepository,
				instrumentRepository: IInstrumentRepository,
				portfolioService: PortfolioService,
			) =>
				new CreateOrderUseCase(
					orderRepository,
					marketDataRepository,
					instrumentRepository,
					portfolioService,
				),
			inject: [
				OrderRepository,
				MarketDataRepository,
				InstrumentRepository,
				PortfolioService,
			],
		},
		{
			provide: SearchInstrumentsUseCase,
			useFactory: (instrumentRepository: InstrumentRepository) => {
				return new SearchInstrumentsUseCase(instrumentRepository);
			},
			inject: [InstrumentRepository],
		},
	],
})
export class AppModule {}
