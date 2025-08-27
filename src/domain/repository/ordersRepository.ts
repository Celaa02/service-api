import {
  confirmOrder,
  createOrders,
  orderByUser,
  orderListResponse,
  ordersByIdResponse,
} from '../models/OrdersModelsHttp';

export interface OrdersRepository {
  createOrders(order: createOrders): Promise<void>;
  getOrderById(order: string): Promise<ordersByIdResponse | null>;
  listOrdersByUser(data: orderByUser): Promise<orderListResponse>;
  confirmOrder(data: confirmOrder): Promise<ordersByIdResponse | null>;
}
