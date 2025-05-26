import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
} from '@nestjs/common';
import { GetPortfolioByUserIdUseCase } from 'src/portfolio/application/usecases/get-portfolio.usecase';
import {
	GetPortfolioResponseDto,
	mapPortfolioToGetPortfolioResponseDto,
} from '../dto/responses/get-portfolio-response.dto';

@Controller('portfolio')
export class PortfolioController {
	constructor(
		private readonly getPortfolioByUserIdUseCase: GetPortfolioByUserIdUseCase,
	) {}

	@Get(':userId')
	@HttpCode(HttpStatus.OK)
	async getPortfolio(
		@Param('userId') userId: string,
	): Promise<GetPortfolioResponseDto> {
		const portfolio = await this.getPortfolioByUserIdUseCase.execute(
			parseInt(userId),
		);

		return mapPortfolioToGetPortfolioResponseDto(portfolio);
	}
}
