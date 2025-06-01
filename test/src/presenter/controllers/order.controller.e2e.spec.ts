import * as request from 'supertest';
import { Server } from 'http';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OrderSide } from 'src/orders/domain/enums/order-side.enum';
import { OrderType } from 'src/orders/domain/enums/order-type.enum';
import { OrderStatus } from 'src/orders/domain/enums/order-status.enum';
import { InstrumentType } from 'src/instruments/domain/enums/instrument-type.enum';

import { IOrderRepository } from 'src/orders/domain/repositories/order.repository.interface';
import { IMarketRepository } from 'src/market/domain/repositories/market-data.repository.interface';
import { IInstrumentRepository } from 'src/instruments/domain/repositories/instrument.repository.interface';

import { Order } from 'src/orders/domain/models/order.model';
import { MarketData } from 'src/market/domain/models/market-data.model';
import { Instrument } from 'src/instruments/domain/models/instrument.model';

import { InstrumentRepository } from 'src/instruments/infrastructure/database/repositories/instrument.repository';

import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';

import { MarketBuyStrategy } from 'src/orders/domain/strategies/market-buy.strategy';
import { MarketSellStrategy } from 'src/orders/domain/strategies/market-sell.strategy';
import { CashOutStrategy } from 'src/orders/domain/strategies/cash.out.strategy';
import { CashInStrategy } from 'src/orders/domain/strategies/cash-in.strategy';
import { LimitBuyStrategy } from 'src/orders/domain/strategies/limit-buy.strategy';
import { LimitSellStrategy } from 'src/orders/domain/strategies/limit-sell.strategy';

import { OrderCreateStrategyFactory } from 'src/orders/domain/factories/create-order.factory';

import { CreateOrderUseCase } from 'src/orders/application/usecases/create-order.usecase';
import { CancelOrderUseCase } from 'src/orders/application/usecases/cancel-order.usecase';

import { OrderController } from 'src/orders/presenter/controllers/order.controller';

describe('OrderController', () => {
	let app: INestApplication;
	const endpoint = '/orders';

	const mockOrderRepository: jest.Mocked<IOrderRepository> = {
		save: jest.fn(),
		getOrders: jest.fn(),
		findById: jest.fn(),
	};

	const mockMarketDataRepository: jest.Mocked<IMarketRepository> = {
		getMarketDataByInstrument: jest.fn(),
	};

	const mockInstrumentRepository: jest.Mocked<IInstrumentRepository> = {
		getById: jest.fn(),
		searchInstrumentsByTicketOrName: jest.fn(),
	};

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [OrderController],
			providers: [
				{ provide: 'IOrderRepository', useValue: mockOrderRepository },
				{
					provide: 'IMarketRepository',
					useValue: mockMarketDataRepository,
				},
				{
					provide: 'IInstrumentRepository',
					useValue: mockInstrumentRepository,
				},
				PortfolioService,
				{
					provide: MarketBuyStrategy,
					useFactory: (
						orderRepository: IOrderRepository,
						marketRepository: IMarketRepository,
						portfolioService: PortfolioService,
						instrumentRepository: InstrumentRepository,
					) =>
						new MarketBuyStrategy(
							orderRepository,
							marketRepository,
							portfolioService,
							instrumentRepository,
						),
					inject: [
						'IOrderRepository',
						'IMarketRepository',
						PortfolioService,
						'IInstrumentRepository',
					],
				},
				{
					provide: MarketSellStrategy,
					useFactory: (
						orderRepository: IOrderRepository,
						marketRepository: IMarketRepository,
						portfolioService: PortfolioService,
						instrumentRepository: InstrumentRepository,
					) =>
						new MarketSellStrategy(
							orderRepository,
							marketRepository,
							portfolioService,
							instrumentRepository,
						),
					inject: [
						'IOrderRepository',
						'IMarketRepository',
						PortfolioService,
						'IInstrumentRepository',
					],
				},
				{
					provide: CashOutStrategy,
					useFactory: (
						orderRepository: IOrderRepository,
						portfolioService: PortfolioService,
						instrumentRepository: InstrumentRepository,
					) =>
						new CashOutStrategy(
							orderRepository,
							portfolioService,
							instrumentRepository,
						),
					inject: [
						'IOrderRepository',
						PortfolioService,
						'IInstrumentRepository',
					],
				},
				{
					provide: CashInStrategy,
					useFactory: (
						orderRepository: IOrderRepository,
						instrumentRepository: InstrumentRepository,
					) =>
						new CashInStrategy(
							orderRepository,
							instrumentRepository,
						),
					inject: ['IOrderRepository', 'IInstrumentRepository'],
				},
				{
					provide: LimitBuyStrategy,
					useFactory: (
						orderRepository: IOrderRepository,
						portfolioService: PortfolioService,
						instrumentRepository: InstrumentRepository,
					) =>
						new LimitBuyStrategy(
							orderRepository,
							portfolioService,
							instrumentRepository,
						),
					inject: [
						'IOrderRepository',
						PortfolioService,
						'IInstrumentRepository',
					],
				},
				{
					provide: LimitSellStrategy,
					useFactory: (
						orderRepository: IOrderRepository,
						portfolioService: PortfolioService,
						instrumentRepository: InstrumentRepository,
					) =>
						new LimitSellStrategy(
							orderRepository,
							portfolioService,
							instrumentRepository,
						),
					inject: [
						'IOrderRepository',
						PortfolioService,
						'IInstrumentRepository',
					],
				},
				{
					provide: OrderCreateStrategyFactory,
					useFactory: (
						marketBuyStrategy: MarketBuyStrategy,
						marketSellStrategy: MarketSellStrategy,
						cashOutStrategy: CashOutStrategy,
						cashInStrategy: CashInStrategy,
						limitBuyStrategy: LimitBuyStrategy,
						limitSellStrategy: LimitSellStrategy,
					) =>
						new OrderCreateStrategyFactory(
							marketBuyStrategy,
							marketSellStrategy,
							cashOutStrategy,
							cashInStrategy,
							limitBuyStrategy,
							limitSellStrategy,
						),
					inject: [
						MarketBuyStrategy,
						MarketSellStrategy,
						CashOutStrategy,
						CashInStrategy,
						LimitBuyStrategy,
						LimitSellStrategy,
					],
				},
				{
					provide: CreateOrderUseCase,
					useFactory: (strategyFactory: OrderCreateStrategyFactory) =>
						new CreateOrderUseCase(strategyFactory),
					inject: [OrderCreateStrategyFactory],
				},
				{
					provide: CancelOrderUseCase,
					useFactory: (orderRepository: IOrderRepository) =>
						new CancelOrderUseCase(orderRepository),
					inject: ['IOrderRepository'],
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	const validInstrument = new Instrument({
		id: 1,
		ticker: 'DYCA',
		name: 'Dycasa S.A.',
		type: InstrumentType.STOCK,
	});

	const validInstrumentCash = new Instrument({
		id: 66,
		ticker: 'ARS',
		name: 'PESOS',
		type: InstrumentType.CURRENCY,
	});

	const validInstrumentStock = new Instrument({
		id: 1,
		ticker: 'DYCA',
		name: 'Dycasa S.A.',
		type: InstrumentType.STOCK,
	});

	const validPreviousOrders = [
		new Order({
			instrument: validInstrumentCash,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.CASH_IN,
			size: 500,
			price: 1,
			status: OrderStatus.FILLED,
			datetime: new Date('2023-09-01T00:00:00Z'),
		}),
		new Order({
			instrument: validInstrumentStock,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.BUY,
			size: 2,
			price: 50,
			status: OrderStatus.FILLED,
			datetime: new Date('2023-09-01T00:00:00Z'),
		}),
	];

	const validPriceMarketData = new MarketData({
		instrumentId: 1,
		high: 100,
		low: 50,
		open: 75,
		close: 100,
		previousClose: 90,
		date: new Date('2023-10-01T00:00:00Z'),
	});

	it('should create a LIMIT BUY order when valid data is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.LIMIT);
			expect(order.getSide()).toBe(OrderSide.BUY);
			expect(order.getPrice()).toBe(100);
			expect(order.getSize()).toBe(1);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.BUY,
			size: 1,
			price: 100,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.BUY,
			size: 1,
			price: 100,
			status: OrderStatus.NEW,
		};

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('should create a LIMIT SELL order when valid data is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.LIMIT);
			expect(order.getSide()).toBe(OrderSide.SELL);
			expect(order.getPrice()).toBe(150);
			expect(order.getSize()).toBe(2);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.SELL,
			size: 2,
			price: 150,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.SELL,
			size: 2,
			price: 150,
			status: OrderStatus.NEW,
		};

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('should create a MARKET BUY order when valid data is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.MARKET);
			expect(order.getSide()).toBe(OrderSide.BUY);
			expect(order.getSize()).toBe(1);
			expect(order.getPrice()).toBe(validPriceMarketData.getClose());
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);
		mockMarketDataRepository.getMarketDataByInstrument.mockResolvedValue(
			validPriceMarketData,
		);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.BUY,
			size: 1,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.BUY,
			size: 1,
			price: validPriceMarketData.getClose(),
			status: OrderStatus.FILLED,
		};

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('should create a MARKET SELL order when valid data is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.MARKET);
			expect(order.getSide()).toBe(OrderSide.SELL);
			expect(order.getSize()).toBe(1);
			expect(order.getPrice()).toBe(validPriceMarketData.getClose());
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);
		mockMarketDataRepository.getMarketDataByInstrument.mockResolvedValue(
			validPriceMarketData,
		);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.SELL,
			size: 1,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.SELL,
			size: 1,
			price: validPriceMarketData.getClose(),
			status: OrderStatus.FILLED,
		};

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('should create a CASH_IN order when valid data is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrumentCash);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrumentCash);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.MARKET);
			expect(order.getSide()).toBe(OrderSide.CASH_IN);
			expect(order.getSize()).toBe(500);
			expect(order.getPrice()).toBe(1);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);

		const payload = {
			instrumentId: 66,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.CASH_IN,
			size: 500,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 66,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.CASH_IN,
			size: 500,
			price: 1,
			status: OrderStatus.FILLED,
		};

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('should create a CASH_OUT order when valid data is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrumentCash);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrumentCash);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.MARKET);
			expect(order.getSide()).toBe(OrderSide.CASH_OUT);
			expect(order.getSize()).toBe(10);
			expect(order.getPrice()).toBe(1);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);

		const payload = {
			instrumentId: 66,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.CASH_OUT,
			size: 10,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 66,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.CASH_OUT,
			size: 10,
			price: 1,
			status: OrderStatus.FILLED,
		};

		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('should create a MARKET BUY order when amount is provided', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.MARKET);
			expect(order.getSide()).toBe(OrderSide.BUY);
			expect(order.getSize()).toBe(3);
			expect(order.getPrice()).toBe(100);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);
		mockMarketDataRepository.getMarketDataByInstrument.mockResolvedValue(
			validPriceMarketData,
		);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.BUY,
			amount: 350,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.BUY,
			size: 3,
			price: 100,
			status: OrderStatus.FILLED,
		};
		expect(response.status).toBe(HttpStatus.CREATED);
		expect(response.body).toEqual(responseExpected);
	});

	it('Given a user with insufficient funds, when placing a BUY order, then it should throw an error and save the order with status REJECTED', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.LIMIT);
			expect(order.getSide()).toBe(OrderSide.BUY);
			expect(order.getSize()).toBe(300);
			expect(order.getPrice()).toBe(100);
			expect(order.getStatus()).toBe(OrderStatus.REJECTED);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);
		mockMarketDataRepository.getMarketDataByInstrument.mockResolvedValue(
			validPriceMarketData,
		);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.BUY,
			size: 300,
			price: 100,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			error: 'Conflict',
			message: 'Insufficient funds to process the transaction',
			statusCode: HttpStatus.CONFLICT,
		};
		expect(response.status).toBe(HttpStatus.CONFLICT);
		expect(response.body).toEqual(responseExpected);
	});

	it('Given a user with insufficient assets, when placing a SELL order, then it should throw an error and save the order with status REJECTED', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockOrderRepository.save.mockImplementation((order: Order) => {
			expect(order.getInstrument()).toBe(validInstrument);
			expect(order.getUserId()).toBe(1);
			expect(order.getType()).toBe(OrderType.LIMIT);
			expect(order.getSide()).toBe(OrderSide.SELL);
			expect(order.getSize()).toBe(300);
			expect(order.getPrice()).toBe(100);
			expect(order.getStatus()).toBe(OrderStatus.REJECTED);
			return Promise.resolve(order);
		});
		mockOrderRepository.getOrders.mockResolvedValue(validPreviousOrders);
		mockMarketDataRepository.getMarketDataByInstrument.mockResolvedValue(
			validPriceMarketData,
		);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.SELL,
			size: 300,
			price: 100,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			error: 'Conflict',
			message: 'Insufficient assets to process the transaction',
			statusCode: HttpStatus.CONFLICT,
		};
		expect(response.status).toBe(HttpStatus.CONFLICT);
		expect(response.body).toEqual(responseExpected);
	});

	it('Given a non-existing instrumentId, when creating an order, then it should return a conflict error', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(null);

		const payload = {
			instrumentId: 999,
			userId: 1,
			type: OrderType.LIMIT,
			side: OrderSide.BUY,
			size: 1,
			price: 100,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			error: 'Conflict',
			message: `Instrument with id ${payload.instrumentId} not found`,
			statusCode: HttpStatus.CONFLICT,
		};

		expect(response.status).toBe(HttpStatus.CONFLICT);
		expect(response.body).toEqual(responseExpected);
	});

	it('Given an instrument without market data, when creating a MARKET order, then it should return a not found error', async () => {
		mockInstrumentRepository.getById.mockResolvedValue(validInstrument);
		mockMarketDataRepository.getMarketDataByInstrument.mockResolvedValue(
			null,
		);

		const payload = {
			instrumentId: 1,
			userId: 1,
			type: OrderType.MARKET,
			side: OrderSide.BUY,
			size: 1,
		};

		const response = await request(app.getHttpServer() as Server)
			.post(endpoint)
			.send(payload);

		const responseExpected = {
			error: 'Conflict',
			message: `Market price not found for instrument with id ${payload.instrumentId}`,
			statusCode: HttpStatus.CONFLICT,
		};

		expect(response.status).toBe(HttpStatus.CONFLICT);
		expect(response.body).toEqual(responseExpected);
	});
});
