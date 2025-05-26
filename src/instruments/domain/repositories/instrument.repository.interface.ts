import { Optional } from 'src/common/utils/utils';
import { Instrument } from '../models/instrument.model';

export interface IInstrumentRepository {
	getById(id: number): Promise<Optional<Instrument>>;

	searchInstrumentsByTicketOrName(
		ticker: string,
		name: string,
	): Promise<Optional<Instrument[]>>;
}
