import { getByIdOrdersDependencies } from './getByIdOrdersDepencies';
import { orderById } from '../../domain/models/OrdersModels';

export type getByIdOrderType = (event: getByIdOrdersDependencies, input: orderById) => Promise<any>;
