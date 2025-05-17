import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'email', type: 'varchar' })
	email: string;

	@Column({ name: 'accountnumber' })
	accountNumber: string;
}
