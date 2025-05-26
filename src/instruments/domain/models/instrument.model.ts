import {
	validateEnum,
	validateNonEmptyString,
	validatePositiveInteger,
} from 'src/common/utils/utils';
import { InstrumentType } from '../enums/instrument-type.enum';

interface InstrumentProps {
	id: number;
	ticker: string;
	name: string;
	type: InstrumentType;
}

export class Instrument {
	private id!: number;
	private ticker!: string;
	private name!: string;
	private type!: InstrumentType;

	constructor(props: InstrumentProps) {
		this.id = props.id;
		this.ticker = props.ticker;
		this.name = props.name;
		this.type = props.type;

		this.validate();
	}

	private validate() {
		validatePositiveInteger(this.id, 'Instrument ID');
		validateNonEmptyString(this.ticker, 'Ticker');
		validateNonEmptyString(this.name, 'Name');
		validateEnum(this.type, InstrumentType, 'Instrument type');
	}

	getId(): number {
		return this.id;
	}

	getTicker(): string {
		return this.ticker;
	}

	getName(): string {
		return this.name;
	}

	getType(): InstrumentType {
		return this.type;
	}
}
