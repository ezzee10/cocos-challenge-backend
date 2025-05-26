import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketData } from 'src/market/domain/models/market-data.model';
import { Optional } from 'src/common/utils/utils';
import { MarketDataEntity } from '../entities/market-data.entity';
import { IMarketRepository } from 'src/market/domain/repositories/market-data.repository.interface';

@Injectable()
export class MarketDataRepository implements IMarketRepository {
	constructor(
		@InjectRepository(MarketDataEntity)
		private readonly marketDataRepository: Repository<MarketDataEntity>,
	) {}

	async getMarketDataByInstrument(
		instrumentId: number,
	): Promise<Optional<MarketData>> {
		const marketDataEntity = await this.marketDataRepository.findOne({
			where: { instrumentId },
			order: { date: 'DESC' },
		});

		if (!marketDataEntity) {
			return null;
		}

		return this.mapMarketDataEntityToMarketData(marketDataEntity);
	}

	private mapMarketDataEntityToMarketData(
		marketEntity: MarketDataEntity,
	): MarketData {
		return new MarketData({
			instrumentId: marketEntity.instrumentId,
			date: marketEntity.date,
			previousClose: marketEntity.previousClose,
			open: marketEntity.open,
			high: marketEntity.high,
			low: marketEntity.low,
			close: marketEntity.close,
		});
	}
}
