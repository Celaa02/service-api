import { createOrdersDependencies } from './CreateOrdersDepencies';
import { createOrders } from '../../domain/models/OrdersModels';

export type createOrderType = (
  event: createOrdersDependencies,
  input: createOrders,
) => Promise<any>;
