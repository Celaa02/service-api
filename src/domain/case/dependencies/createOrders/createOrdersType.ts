import { createOrdersDependencies } from './CreateOrdersDepencies';
import { createOrders } from '../../../models/OrdersModelsHttp';

export type createOrderType = (
  event: createOrdersDependencies,
  input: createOrders,
) => Promise<any>;
