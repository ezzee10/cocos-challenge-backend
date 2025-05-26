import {
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Query,
} from '@nestjs/common';
import { SearchInstrumentsUseCase } from 'src/instruments/application/usecases/search-instruments.usecase';
import { Instrument } from 'src/instruments/domain/models/instrument.model';

@Controller('instruments')
export class InstrumentController {
	constructor(
		private readonly searchInstrumentsUseCase: SearchInstrumentsUseCase,
	) {}

	@Get('search')
	@HttpCode(HttpStatus.OK)
	async searchInstruments(
		@Query('ticker') ticker: string,
		@Query('name') name: string,
	): Promise<Instrument[]> {
		if (!ticker && !name) {
			throw new BadRequestException(
				'At least one of ticker or name query parameters is required.',
			);
		}

		return this.searchInstrumentsUseCase.execute(ticker, name);
	}
}
