import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './infrastructure/database/entities/order.entity';
import { UserEntity } from './infrastructure/database/entities/user.entity';
import { InstrumentEntity } from './infrastructure/database/entities/instrument.entity';
import { OrderController } from './presenter/controllers/order.controller';
import { CreateOrderUseCase } from './application/create-order.usecase';
import { MarketDataEntity } from './infrastructure/database/entities/market-data.entity';

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
	controllers: [OrderController],
	providers: [
		{
			provide: CreateOrderUseCase,
			useFactory: () => new CreateOrderUseCase(),
		},
	],
})
export class AppModule {}
