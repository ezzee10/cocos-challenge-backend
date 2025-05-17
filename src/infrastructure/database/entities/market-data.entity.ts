import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'marketdata' })
export class MarketDataEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'instrumentid', type: 'numeric' })
	instrumentId: number;

	@Column({ type: 'numeric' })
	high: number;

	@Column({ type: 'numeric' })
	low: number;

	@Column({ type: 'numeric' })
	open: number;

	@Column({ type: 'numeric' })
	close: number;

	@Column({ name: 'previousclose', type: 'numeric' })
	previousClose: number;

	@Column({ type: 'date' })
	date: Date;
}
