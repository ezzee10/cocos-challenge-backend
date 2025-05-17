import { Optional } from 'src/utils/utils';
import { MarketData } from '../models/market-data.model';

export interface IMarketRepository {
	getMarketDataByInstrument(
		instrumentId: number,
	): Promise<Optional<MarketData>>;
}
