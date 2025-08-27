import { statusConfirmOrdersDependencies } from './statusConfirmOrdersDepencies';
import { confirmOrder } from '../../../models/OrdersModelsHttp';

export type statusConfirmOrderType = (
  event: statusConfirmOrdersDependencies,
  input: confirmOrder,
) => Promise<any>;
