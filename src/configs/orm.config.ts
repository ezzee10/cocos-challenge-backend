import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { InstrumentEntity } from 'src/instruments/infrastructure/database/entities/instrument.entity';
import { UserEntity } from 'src/users/infrastructure/database/entities/user.entity';
import { MarketDataEntity } from 'src/market/infrastructure/database/entities/market-data.entity';
import { OrderEntity } from 'src/orders/infrastructure/database/entities/order.entity';

export const getTypeOrmConfig = (
	configService: ConfigService,
): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.get<string>('DB_HOST'),
	port: configService.get<number>('DB_PORT'),
	username: configService.get<string>('DB_USERNAME'),
	password: configService.get<string>('DB_PASSWORD'),
	database: configService.get<string>('DB_NAME'),
	entities: [InstrumentEntity, UserEntity, MarketDataEntity, OrderEntity],
	synchronize: false,
	ssl: configService.get<string>('DB_SSL') === 'true',
});
