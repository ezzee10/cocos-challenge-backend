import { Portfolio } from 'src/domain/models/portfolio.model';
import { OrderStatus } from 'src/domain/enums/order-status.enum';
import { IOrderRepository } from 'src/domain/repositories/order.repository.interface';
import { PortfolioService } from 'src/domain/services/portfolio.service';
import { CalculatePositionsByOrdersUseCase } from './calculate-positions.usecase';
export class GetPortfolioByUserIdUseCase {
	constructor(
		private readonly orderRepository: IOrderRepository,
		private readonly calculatePositionsByOrders: CalculatePositionsByOrdersUseCase,
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
