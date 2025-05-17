import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { InstrumentType } from 'src/domain/enums/instrument-type.enum';

@Entity({ name: 'instruments' })
export class InstrumentEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'ticker', type: 'varchar' })
	ticker: string;

	@Column({ name: 'name', type: 'varchar' })
	name: string;

	@Column({ name: 'type', type: 'varchar' })
	type: InstrumentType;
}
