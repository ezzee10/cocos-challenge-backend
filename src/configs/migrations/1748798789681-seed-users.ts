import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUsers1748798789681 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`INSERT INTO users (email,accountNumber) VALUES
                ('emiliano@test.com','10001'),
                ('jose@test.com','10002'),
                ('francisco@test.com','10003'),
                ('juan@test.com','10004');`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DELETE FROM users');
	}
}
