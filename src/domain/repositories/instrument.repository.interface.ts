import { Optional } from 'src/utils/utils';
import { Instrument } from '../models/instrument.model';

export interface IInstrumentRepository {
	getById(id: number): Promise<Optional<Instrument>>;
}
