import { Optional } from 'src/common/utils/utils';
import { MarketData } from '../models/market-data.model';

export interface IMarketRepository {
	getMarketDataByInstrument(
		instrumentId: number,
	): Promise<Optional<MarketData>>;
}
