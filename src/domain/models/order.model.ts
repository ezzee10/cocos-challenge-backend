import {
	validateDatetime,
	validateEnum,
	validateInstanceOf,
	validatePositiveInteger,
} from 'src/utils/utils';
import { OrderSide } from '../enums/order-side.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { Instrument } from './instrument.model';

interface OrderProps {
	instrument: Instrument;
	userId: number;
	size: number;
	price: number;
	type: OrderType;
	side: OrderSide;
	datetime: Date;
}

export class Order {
	private instrument!: Instrument;
	private userId!: number;
	private size!: number;
	private price!: number;
	private type!: OrderType;
	private side!: OrderSide;
	private status!: OrderStatus;
	private datetime!: Date;

	constructor(props: OrderProps) {
		this.instrument = props.instrument;
		this.userId = props.userId;
		this.size = props.size;
		this.price = props.price;
		this.type = props.type;
		this.side = props.side;
		this.datetime = props.datetime;
		this.status = this.resolveStatusByType(props.type);

		this.validate();
	}

	private validate() {
		validateInstanceOf(this.instrument, Instrument, 'Instrument');
		validatePositiveInteger(this.userId, 'User ID');
		validateEnum(this.type, OrderType, 'Order type');
		validateEnum(this.side, OrderSide, 'Order side');
		validatePositiveInteger(this.size, 'Size');
		this.validatePrice(this.price);
		validateDatetime(this.datetime, 'Datetime');
	}

	private validatePrice(price: number) {
		if (this.type === OrderType.LIMIT) {
			if (price === undefined || price <= 0) {
				throw new Error(
					`${OrderType.LIMIT} orders must include a valid price`,
				);
			}
		}
	}

	private resolveStatusByType(type: OrderType): OrderStatus {
		if (type === OrderType.LIMIT) {
			return OrderStatus.NEW;
		}

		if (type === OrderType.MARKET) {
			return OrderStatus.FILLED;
		}

		throw new Error('Invalid order type. Cannot determine status.');
	}

	public cancelOrder(): void {
		if (this.status !== OrderStatus.NEW) {
			throw new Error(
				`Only orders in ${OrderStatus.NEW} status can be cancelled.`,
			);
		}
		this.status = OrderStatus.CANCELLED;
	}

	public rejectOrder(): void {
		this.status = OrderStatus.REJECTED;
	}

	getStatus(): OrderStatus {
		return this.status;
	}

	getType(): OrderType {
		return this.type;
	}

	getInstrument(): Instrument {
		return this.instrument;
	}

	getUserId(): number {
		return this.userId;
	}

	getSize(): number {
		return this.size;
	}

	getPrice(): number {
		return this.price;
	}

	getSide(): OrderSide {
		return this.side;
	}

	getDatetime(): Date {
		return this.datetime;
	}
}
