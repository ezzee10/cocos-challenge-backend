import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'userroot',
	password: 'pass',
	database: 'cocos_challenge',
	synchronize: false,
	logging: false,
	entities: [],
	migrations: ['src/configs/migrations/*.ts'],
});
