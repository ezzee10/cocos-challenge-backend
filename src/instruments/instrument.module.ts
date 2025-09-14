import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstrumentEntity } from './infrastructure/database/entities/instrument.entity';
import { InstrumentRepository } from './infrastructure/database/repositories/instrument.repository';
import { SearchInstrumentsUseCase } from './application/usecases/search-instruments.usecase';
import { InstrumentController } from './presenter/controllers/instrument.controller';

@Module({
	imports: [TypeOrmModule.forFeature([InstrumentEntity])],
	providers: [
		{ provide: 'IInstrumentRepository', useClass: InstrumentRepository },
		{
			provide: SearchInstrumentsUseCase,
			useFactory: (instrumentRepository: InstrumentRepository) =>
				new SearchInstrumentsUseCase(instrumentRepository),
			inject: ['IInstrumentRepository'],
		},
	],
	controllers: [InstrumentController],
	exports: ['IInstrumentRepository', SearchInstrumentsUseCase],
})
export class InstrumentModule {}
