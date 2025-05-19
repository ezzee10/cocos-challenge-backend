import { Instrument } from './instrument.model';

interface PositionProps {
	instrument: Instrument;
	quantity: number;
	positionValue: number;
	performance: number;
}

export class Position {
	private instrument!: Instrument;
	private quantity!: number;
	private positionValue!: number;
	private performance!: number;

	constructor(props: PositionProps) {
		this.instrument = props.instrument;
		this.quantity = props.quantity;
		this.positionValue = props.positionValue;
		this.performance = props.performance;
	}

	getInstrument(): Instrument {
		return this.instrument;
	}

	getQuantity(): number {
		return this.quantity;
	}

	getPositionValue(): number {
		return this.positionValue;
	}

	getPerformance(): number {
		return this.performance;
	}

	setInstrument(instrument: Instrument): void {
		this.instrument = instrument;
	}

	setQuantity(quantity: number): void {
		this.quantity = quantity;
	}

	setPositionValue(positionValue: number): void {
		this.positionValue = positionValue;
	}

	setPerformance(performance: number): void {
		this.performance = performance;
	}
}
