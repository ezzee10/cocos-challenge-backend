import { Inject } from '@nestjs/common';
import { OrderStatus } from 'src/orders/domain/enums/order-status.enum';
import { IOrderRepository } from 'src/orders/domain/repositories/order.repository.interface';
import { CalculatePositionsByOrdersUseCase } from './calculate-positions.usecase';
import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';
import { Portfolio } from 'src/portfolio/domain/models/portfolio.model';

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
