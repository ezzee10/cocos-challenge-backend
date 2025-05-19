import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
} from '@nestjs/common';
import { GetPortfolioByUserIdUseCase } from 'src/application/usecases/get-portfolio.usecase';
import { Portfolio } from 'src/domain/models/portfolio.model';

@Controller('portfolio')
export class PortfolioController {
	constructor(
		private readonly getPortfolioByUserIdUseCase: GetPortfolioByUserIdUseCase,
	) {}

	@Get(':userId')
	@HttpCode(HttpStatus.OK)
	async getPortfolio(@Param('userId') userId: string): Promise<Portfolio> {
		return this.getPortfolioByUserIdUseCase.execute(parseInt(userId));
	}
}
