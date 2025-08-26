import { createOrders, orderByIdResponse } from '../models/OrdersModelsHttp';

export interface OrdersRepository {
  createOrders(order: createOrders): Promise<void>;
  getOrderById(order: string): Promise<orderByIdResponse | null>;
}
