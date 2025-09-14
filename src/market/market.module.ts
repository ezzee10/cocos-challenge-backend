import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataEntity } from './infrastructure/database/entities/market-data.entity';
import { MarketDataRepository } from './infrastructure/database/repositories/market-data.repository';

@Module({
	imports: [TypeOrmModule.forFeature([MarketDataEntity])],
	providers: [
		{ provide: 'IMarketRepository', useClass: MarketDataRepository },
	],
	exports: ['IMarketRepository'],
})
export class MarketModule {}
