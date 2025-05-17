import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { OrderSide } from 'src/domain/enums/order-side.enum';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { OrderType } from 'src/domain/enums/order-type.enum';
import { InstrumentEntity } from './instrument.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => InstrumentEntity)
	@JoinColumn({ name: 'instrumentid' })
	instrument: InstrumentEntity;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: 'userid' })
	user: UserEntity;

	@Column({ name: 'size', type: 'int' })
	size: number;

	@Column({ name: 'price', type: 'decimal' })
	price: number;

	@Column({ name: 'side', type: 'varchar' })
	side: OrderSide;

	@Column({ name: 'status', type: 'varchar' })
	status: OrderStatus;

	@Column({ name: 'type', type: 'varchar' })
	type: OrderType;

	@Column({ name: 'datetime', type: 'timestamp' })
	datetime: Date;
}
