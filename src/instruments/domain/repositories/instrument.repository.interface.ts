import { Optional } from 'src/common/utils/utils';
import { Instrument } from '../models/instrument.model';

export interface SearchInstrumentsFilter {
	ticker?: string;
	name?: string;
}

export interface IInstrumentRepository {
	getById(id: number): Promise<Optional<Instrument>>;

	searchInstruments(
		searchFilter: SearchInstrumentsFilter,
	): Promise<Optional<Instrument[]>>;
}
