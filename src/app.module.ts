import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './orders/order.module';
import { MarketModule } from './market/market.module';
import { InstrumentModule } from './instruments/instrument.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { UserModule } from './users/user.module';

import { getTypeOrmConfig } from './configs/orm.config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) =>
				getTypeOrmConfig(configService),
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
