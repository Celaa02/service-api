import { listProductsDependencies } from './listProductsDepencies';
import { listProduct } from '../../domain/models/ProductsMondels';

export type listProductsType = (
  event: listProductsDependencies,
  input: listProduct,
) => Promise<any>;
