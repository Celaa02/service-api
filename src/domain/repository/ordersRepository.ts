import { createOrders } from '../models/OrdersModelsHttp';

export interface OrdersRepository {
  createOrders(order: createOrders): Promise<void>;
}
