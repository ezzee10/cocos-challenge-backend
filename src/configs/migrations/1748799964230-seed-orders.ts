import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedOrders1748799964230 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`INSERT INTO "orders" (instrumentId,userId,size,price,side,status,type,datetime) VALUES
				(66,1,1000000,1,'CASH_IN','FILLED','MARKET','2023-07-12 12:11:20'),
				(47,1,50,930,'BUY','FILLED','MARKET','2023-07-12 12:31:20'),
				(47,1,50,920,'BUY','CANCELLED','LIMIT','2023-07-12 14:21:20'),
				(47,1,10,940,'SELL','FILLED','MARKET','2023-07-12 14:51:20'),
				(45,1,50,710,'BUY','NEW','LIMIT','2023-07-12 15:14:20'),
				(47,1,100,950,'SELL','REJECTED','MARKET','2023-07-12 16:11:20'),
				(31,1,60,1500,'BUY','NEW','LIMIT','2023-07-13 11:13:20'),
				(66,1,100000,1,'CASH_OUT','FILLED','MARKET','2023-07-13 12:31:20'),
				(31,1,20,1540,'BUY','FILLED','LIMIT','2023-07-13 12:51:20'),
				(54,1,500,250,'BUY','FILLED','MARKET','2023-07-13 14:11:20'),
				(31,1,30,1530,'SELL','FILLED','MARKET','2023-07-13 15:13:20');`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DELETE FROM orders');
	}
}
