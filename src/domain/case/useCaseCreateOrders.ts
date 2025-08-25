import { createOrdersDependencies } from './dependencies/CreateOrdersDepencies';
import { _201_CREATED_ } from '../../utils/HttpResponse';
import { AppError } from '../../utils/HttpResponseErrors';
import { createOrders } from '../models/OrdersModelsHttp';
import { createOrderType } from './dependencies/createOrdersType';

export const useCaseCreateOrders =
  (): createOrderType => async (dependencies: createOrdersDependencies, input: createOrders) => {
    try {
      return _201_CREATED_(input);
    } catch (err: any) {
      return AppError.invalidInput(err.message);
    }
  };
