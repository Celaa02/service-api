import { getByIdProductsDependencies } from './getByIdOrdersDepencies';

export type getByIdProductsType = (
  event: getByIdProductsDependencies,
  input: string,
) => Promise<any>;
