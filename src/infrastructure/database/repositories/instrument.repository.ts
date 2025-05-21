import { Injectable } from '@nestjs/common';
import { InstrumentEntity } from '../entities/instrument.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Instrument } from 'src/domain/models/instrument.model';
import { Optional } from 'src/utils/utils';
import { IInstrumentRepository } from 'src/domain/repositories/instrument.repository.interface';

@Injectable()
export class InstrumentRepository implements IInstrumentRepository {
	constructor(
		@InjectRepository(InstrumentEntity)
		private readonly instrumentRepository: Repository<InstrumentEntity>,
	) {}

	async getById(id: number): Promise<Optional<Instrument>> {
		const instrumentEntity = await this.instrumentRepository.findOne({
			where: { id },
		});

		if (!instrumentEntity) {
			return null;
		}

		return this.mapInstrumentEntityToInstrument(instrumentEntity);
	}

	private mapInstrumentEntityToInstrument(
		instrumentEntity: InstrumentEntity,
	): Instrument {
		return new Instrument({
			id: instrumentEntity.id,
			ticker: instrumentEntity.ticker,
			name: instrumentEntity.name,
			type: instrumentEntity.type,
		});
	}
}
