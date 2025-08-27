import { statusConfirmOrdersDependencies } from './statusConfirmOrdersDepencies';
import { confirmOrder } from '../../domain/models/OrdersModels';

export type statusConfirmOrderType = (
  event: statusConfirmOrdersDependencies,
  input: confirmOrder,
) => Promise<any>;
