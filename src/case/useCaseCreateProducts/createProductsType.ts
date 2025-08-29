import { createProductsDependencies } from './CreateProductsDepencies';
import { productCreate } from '../../domain/models/ProductsMondels';

export type createProductsType = (
  event: createProductsDependencies,
  input: productCreate,
) => Promise<any>;
