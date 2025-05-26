import { Injectable } from '@nestjs/common';
import { InstrumentEntity } from '../entities/instrument.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Optional } from 'src/common/utils/utils';
import { Instrument } from 'src/instruments/domain/models/instrument.model';
import { IInstrumentRepository } from 'src/instruments/domain/repositories/instrument.repository.interface';

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

	async searchInstrumentsByTicketOrName(
		ticker: string,
		name: string,
	): Promise<Optional<Instrument[]>> {
		const where = [{ ticker }, { name: Like(`%${name}%`) }];

		const instrumentEntities = await this.instrumentRepository.find({
			where,
		});

		return instrumentEntities.map((instrumentEntity) =>
			this.mapInstrumentEntityToInstrument(instrumentEntity),
		);
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
