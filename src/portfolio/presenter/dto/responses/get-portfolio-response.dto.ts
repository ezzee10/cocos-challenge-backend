import { Portfolio } from 'src/portfolio/domain/models/portfolio.model';
import { Position } from 'src/portfolio/domain/models/position.model';

export interface PositionResponseDto {
	id: number;
	ticker: string;
	name: string;
	type: string;
	quantity: number;
	positionValue: number;
	performance: number;
}

export interface GetPortfolioResponseDto {
	availableCash: number;
	totalBalance: number;
	positions: PositionResponseDto[];
}

function mapPositionToDto(position: Position): PositionResponseDto {
	const instrument = position.getInstrument();
	return {
		id: instrument.getId(),
		ticker: instrument.getTicker(),
		name: instrument.getName(),
		type: instrument.getType(),
		quantity: position.getQuantity(),
		positionValue: position.getPositionValue(),
		performance: position.getPerformance(),
	};
}

export function mapPortfolioToGetPortfolioResponseDto(
	portfolio: Portfolio,
): GetPortfolioResponseDto {
	return {
		availableCash: portfolio.getAvailableCash(),
		totalBalance: portfolio.getTotalBalance(),
		positions: portfolio.getPositions().map(mapPositionToDto),
	};
}
