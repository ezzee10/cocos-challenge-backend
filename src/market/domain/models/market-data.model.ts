interface MarketProps {
	instrumentId: number;
	high: number;
	low: number;
	open: number;
	close: number;
	previousClose: number;
	date: Date;
}

export class MarketData {
	private instrumentId: number;
	private high: number;
	private low: number;
	private open: number;
	private close: number;
	private previousClose: number;
	private date: Date;

	constructor(props: MarketProps) {
		this.instrumentId = props.instrumentId;
		this.high = props.high;
		this.low = props.low;
		this.open = props.open;
		this.close = props.close;
		this.previousClose = props.previousClose;
		this.date = props.date;
	}

	getInstrumentId(): number {
		return this.instrumentId;
	}

	getHigh(): number {
		return this.high;
	}

	getLow(): number {
		return this.low;
	}

	getOpen(): number {
		return this.open;
	}

	getClose(): number {
		return this.close;
	}

	getPreviousClose(): number {
		return this.previousClose;
	}

	getDate(): Date {
		return this.date;
	}
}
