import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1748793015223 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255),
                accountNumber VARCHAR(20)
            );`,
		);

		await queryRunner.query(
			`CREATE TABLE instruments (
                id SERIAL PRIMARY KEY,
                ticker VARCHAR(10),
                name VARCHAR(255),
                type VARCHAR(10)
            );`,
		);

		await queryRunner.query(
			`CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                instrumentId INT,
                userId INT,
                size INT,
                price NUMERIC(10, 2),
                type VARCHAR(10),
                side VARCHAR(10),
                status VARCHAR(20),
                datetime TIMESTAMP,
                FOREIGN KEY (instrumentId) REFERENCES instruments(id),
                FOREIGN KEY (userId) REFERENCES users(id)
            );`,
		);

		await queryRunner.query(
			`CREATE TABLE marketdata (
                id SERIAL PRIMARY KEY,
                instrumentId INT,
                high NUMERIC(10, 2),
                low NUMERIC(10, 2),
                open NUMERIC(10, 2),
                close NUMERIC(10, 2),
                previousClose NUMERIC(10, 2),
                date DATE,
                FOREIGN KEY (instrumentId) REFERENCES instruments(id)
            );`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS marketdata;`);
		await queryRunner.query(`DROP TABLE IF EXISTS orders;`);
		await queryRunner.query(`DROP TABLE IF EXISTS instruments;`);
		await queryRunner.query(`DROP TABLE IF EXISTS users;`);
	}
}
