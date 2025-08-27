import { getByUserOrdersDependencies } from './getByUserOrdersDepencies';
import { orderByUser } from '../../../models/OrdersModelsHttp';

export type getByUsrOrderType = (
  event: getByUserOrdersDependencies,
  input: orderByUser,
) => Promise<any>;
