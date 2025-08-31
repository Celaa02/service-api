import { deleteByIdProductsDependencies } from './deleteByIdOrdersDepencies';

export type deleteByIdProductsType = (
  event: deleteByIdProductsDependencies,
  input: string,
) => Promise<any>;
