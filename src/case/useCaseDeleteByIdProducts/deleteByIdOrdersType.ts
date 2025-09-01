import { deleteByIdProductsDependencies } from './deleteByIdOrdersDepencies';

/**
 * Tipo que define la firma del caso de uso `deleteByIdProducts`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`deleteByIdProductsDependencies`).
 * 2. Recibe el `productId` como `string` para identificar el producto a eliminar.
 * 3. Retorna una promesa con el resultado de la eliminación.
 */
export type deleteByIdProductsType = (
  event: deleteByIdProductsDependencies,
  input: string,
) => Promise<any>;
