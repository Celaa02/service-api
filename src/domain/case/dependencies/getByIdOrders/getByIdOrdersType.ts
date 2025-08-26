import { getByIdOrdersDependencies } from './getByIdOrdersDepencies';
import { orderById } from '../../../models/OrdersModelsHttp';

export type getByIdOrderType = (event: getByIdOrdersDependencies, input: orderById) => Promise<any>;
