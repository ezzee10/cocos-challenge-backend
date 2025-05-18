import { Injectable } from '@nestjs/common';
import { Instrument } from 'src/domain/models/instrument.model';
import { IInstrumentRepository } from 'src/domain/repositories/instrument.repository.interface';

@Injectable()
export class SearchInstrumentsUseCase {
	constructor(private readonly instrumentRepository: IInstrumentRepository) {}

	async execute(ticker: string, name: string): Promise<Instrument[]> {
		const instruments =
			await this.instrumentRepository.searchInstrumentsByTicketOrName(
				ticker,
				name,
			);

		return instruments || [];
	}
}
