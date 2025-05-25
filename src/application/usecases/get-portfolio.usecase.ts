import { Portfolio } from 'src/domain/models/portfolio.model';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { PortfolioService } from 'src/domain/services/portfolio.service';
import { CalculatePositionsByOrdersUseCase } from './calculate-positions.usecase';
import { Inject } from '@nestjs/common';
export class GetPortfolioByUserIdUseCase {
	constructor(
		@Inject('IOrderRepository')
		private readonly orderRepository: IOrderRepository,

		@Inject(CalculatePositionsByOrdersUseCase)
		private readonly calculatePositionsByOrders: CalculatePositionsByOrdersUseCase,

		@Inject(PortfolioService)
		private readonly portfolioService: PortfolioService,
	) {}

	async execute(userId: number): Promise<Portfolio> {
		const orders = await this.orderRepository.getOrdersByUserIdAndStatus(
			userId,
			OrderStatus.FILLED,
		);

		const positions = await this.calculatePositionsByOrders.execute(orders);

		const availableCash =
			this.portfolioService.calculateAvailableCash(orders);

		const stockHoldingsValue =
			this.portfolioService.calculateStockHoldingsValue(orders);

		const totalBalance = availableCash + stockHoldingsValue;

		return new Portfolio({
			userId,
			availableCash,
			positions,
			totalBalance,
		});
	}
}
