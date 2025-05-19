import { Position } from './position.model';

interface PortfolioProps {
	userId: number;
	availableCash: number;
	totalBalance: number;
	positions: Position[];
}

export class Portfolio {
	private userId!: number;
	private availableCash!: number;
	private totalBalance!: number;
	private positions!: Position[];

	constructor(props: PortfolioProps) {
		this.userId = props.userId;
		this.availableCash = props.availableCash;
		this.positions = props.positions;
		this.totalBalance = props.totalBalance;
	}

	getPositions(): Position[] {
		return this.positions;
	}

	getUserId(): number {
		return this.userId;
	}

	getAvailableCash(): number {
		return this.availableCash;
	}

	getTotalBalance(): number {
		return this.totalBalance;
	}
}
