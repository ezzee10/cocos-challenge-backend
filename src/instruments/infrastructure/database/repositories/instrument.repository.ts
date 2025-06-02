import { Injectable } from '@nestjs/common';
import { InstrumentEntity } from '../entities/instrument.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Optional } from 'src/common/utils/utils';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import {
	IInstrumentRepository,
	SearchInstrumentsFilter,
} from 'src/instruments/domain/repositories/instrument.repository.interface';

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

	async searchInstruments(
		searchFilter: SearchInstrumentsFilter,
	): Promise<Instrument[]> {
		const where: FindOptionsWhere<InstrumentEntity> = {};

		if (searchFilter.ticker) {
			where.ticker = searchFilter.ticker;
		}

		if (searchFilter.name) {
			where.name = Like(`%${searchFilter.name}%`);
		}

		const instrumentEntities = await this.instrumentRepository.find({
			where,
		});

		return instrumentEntities.map(this.mapInstrumentEntityToInstrument);
	}

	private mapInstrumentEntityToInstrument = (
		instrumentEntity: InstrumentEntity,
	): Instrument => {
		return new Instrument({
			id: instrumentEntity.id,
			ticker: instrumentEntity.ticker,
			name: instrumentEntity.name,
			type: instrumentEntity.type,
		});
	};
}
