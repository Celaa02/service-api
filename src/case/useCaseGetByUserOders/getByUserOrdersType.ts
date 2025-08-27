import { getByUserOrdersDependencies } from './getByUserOrdersDepencies';
import { orderByUser } from '../../domain/models/OrdersModels';

export type getByUsrOrderType = (
  event: getByUserOrdersDependencies,
  input: orderByUser,
) => Promise<any>;
