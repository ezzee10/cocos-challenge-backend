import { InstrumentType } from 'src/domain/enums/instrument-type.enum';
import { OrderSide } from 'src/domain/enums/order-side.enum';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { OrderType } from 'src/domain/enums/order-type.enum';
import { Instrument } from 'src/domain/models/instrument.model';
import { Order } from 'src/domain/models/order.model';

describe('Order', () => {
	const validInstrumentCash = new Instrument({
		id: 66,
		ticker: 'ARS',
		name: 'PESOS',
		type: InstrumentType.CURRENCY,
	});

	const validProps = {
		instrument: validInstrumentCash,
		userId: 1,
		size: 10,
		price: 100,
		type: OrderType.LIMIT,
		side: OrderSide.BUY,
		status: OrderStatus.NEW,
		datetime: new Date('2023-01-01T00:00:00Z'),
	};

	describe('Order Model', () => {
		describe('Create an order', () => {
			it('Given valid order props, when creating an Order, then it should instantiate with correct status and call validations', () => {
				const order = new Order(validProps);

				expect(order.getInstrument()).toBe(validProps.instrument);
				expect(order.getUserId()).toBe(validProps.userId);
				expect(order.getSize()).toBe(validProps.size);
				expect(order.getPrice()).toBe(validProps.price);
				expect(order.getType()).toBe(validProps.type);
				expect(order.getSide()).toBe(validProps.side);
				expect(order.getDatetime()).toEqual(validProps.datetime);
				expect(order.getStatus()).toBe(OrderStatus.NEW);
			});

			it('Given a MARKET order type, when creating an Order, then status should be FILLED', () => {
				const props = {
					...validProps,
					type: OrderType.MARKET,
					price: 1,
				};

				const order = new Order(props);

				expect(order.getStatus()).toBe(OrderStatus.FILLED);
			});

			it('Given an invalid order type, when creating an Order, then it should throw an error', () => {
				const props = {
					...validProps,
					type: 'INVALID_TYPE' as OrderType,
				};

				expect(() => new Order(props)).toThrow(
					'Invalid order type. Cannot determine status.',
				);
			});

			it('Given a LIMIT order with price <= 0 or is not defined, when creating an Order, then it should throw an error', () => {
				const props = { ...validProps, price: 0 };

				expect(() => new Order(props)).toThrow(
					'LIMIT orders must include a valid price',
				);
			});
		});

		describe('cancelOrder', () => {
			it('Given a NEW order, when cancelOrder is called, then status should be CANCELLED', () => {
				const order = new Order(validProps);
				expect(order.getStatus()).toBe(OrderStatus.NEW);

				order.cancelOrder();

				expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
			});

			it('Given an order NOT in NEW status, when cancelOrder is called, then it should throw an error', () => {
				const props = { ...validProps, type: OrderType.MARKET };
				const order = new Order(props);
				expect(order.getStatus()).toBe(OrderStatus.FILLED);

				expect(() => order.cancelOrder()).toThrow(
					`Only orders in ${OrderStatus.NEW} status and of type ${OrderType.LIMIT} can be canceled`,
				);
			});
		});

		describe('rejectOrder', () => {
			it('Given any order, when rejectOrder is called, then status should be REJECTED', () => {
				const order = new Order(validProps);
				expect(order.getStatus()).toBe(OrderStatus.NEW);

				order.rejectOrder();

				expect(order.getStatus()).toBe(OrderStatus.REJECTED);
			});
		});
	});
});
