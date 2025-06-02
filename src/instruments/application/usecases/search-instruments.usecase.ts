import { Inject, Injectable } from '@nestjs/common';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import { IInstrumentRepository } from 'src/instruments/domain/repositories/instrument.repository.interface';

@Injectable()
export class SearchInstrumentsUseCase {
	constructor(
		@Inject('IInstrumentRepository')
		private readonly instrumentRepository: IInstrumentRepository,
	) {}

	async execute(ticker: string, name: string): Promise<Instrument[]> {
		const instruments = await this.instrumentRepository.searchInstruments({
			ticker,
			name,
		});
		return instruments || [];
	}
}
