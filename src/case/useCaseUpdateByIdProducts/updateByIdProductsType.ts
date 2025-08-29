import { updateByIdProductsDependencies } from './updateByIdProductsDepencies';
import { UpdateProductInput } from '../../domain/models/ProductsMondels';

export type updateByIdProductsType = (
  event: updateByIdProductsDependencies,
  input: UpdateProductInput,
) => Promise<any>;
