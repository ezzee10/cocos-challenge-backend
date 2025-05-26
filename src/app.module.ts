import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './orders/order.module';

import { UserEntity } from './users/infrastructure/database/entities/user.entity';
import { MarketDataEntity } from './market/infrastructure/database/entities/market-data.entity';
import { InstrumentEntity } from './instruments/infrastructure/database/entities/instrument.entity';
import { OrderEntity } from './orders/infrastructure/database/entities/order.entity';

import { MarketModule } from './market/market.module';
import { InstrumentModule } from './instruments/instrument.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { UserModule } from './users/user.module';

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
					InstrumentEntity,
					UserEntity,
					MarketDataEntity,
					OrderEntity,
				],
				synchronize: false,
				ssl: process.env.DB_SSL === 'true',
			}),
		}),
		OrderModule,
		MarketModule,
		InstrumentModule,
		PortfolioModule,
		UserModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
