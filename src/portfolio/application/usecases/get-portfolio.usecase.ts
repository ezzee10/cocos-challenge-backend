import { Inject } from '@nestjs/common';
import { OrderStatus } from 'src/orders/domain/enums/order-status.enum';
import { IOrderRepository } from 'src/orders/domain/repositories/order.repository.interface';
import { CreatePositionsByOrdersUseCase } from './create-positions.usecase';
import { PortfolioService } from 'src/portfolio/domain/services/portfolio.service';
import { Portfolio } from 'src/portfolio/domain/models/portfolio.model';
import { Order } from 'src/orders/domain/models/order.model';
import { InstrumentType } from 'src/instruments/domain/enums/instrument-type.enum';
import { Position } from 'src/portfolio/domain/models/position.model';

export class GetPortfolioByUserIdUseCase {
	constructor(
		@Inject('IOrderRepository')
		private readonly orderRepository: IOrderRepository,

		@Inject(CreatePositionsByOrdersUseCase)
		private readonly createPositionsByOrders: CreatePositionsByOrdersUseCase,

		@Inject(PortfolioService)
		private readonly portfolioService: PortfolioService,
	) {}

	async execute(userId: number): Promise<Portfolio> {
		const orders = await this.orderRepository.getOrders({
			userId,
			status: OrderStatus.FILLED,
		});

		if (orders.length === 0) {
			return new Portfolio({
				userId,
				availableCash: 0,
				positions: [],
				totalBalance: 0,
			});
		}

		const availableCash =
			this.portfolioService.calculateAvailableCash(orders);

		const stockOrders = this.filterStockOrders(orders);

		const positions =
			await this.createPositionsByOrders.execute(stockOrders);

		const stockHoldingsValue = this.getStockHoldingsValue(positions);

		const totalBalance = availableCash + stockHoldingsValue;

		return new Portfolio({
			userId,
			availableCash,
			positions,
			totalBalance,
		});
	}

	private filterStockOrders(orders: Order[]): Order[] {
		return orders.filter(
			(o) => o.getInstrument().getType() === InstrumentType.STOCK,
		);
	}

	private getStockHoldingsValue(positions: Position[]): number {
		return positions.reduce((acc, pos) => acc + pos.getPositionValue(), 0);
	}
}
