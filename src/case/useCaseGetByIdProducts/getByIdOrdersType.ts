import { getByIdProductsDependencies } from './getByIdOrdersDepencies';

/**
 * Tipo que define la firma del caso de uso `getByIdProducts`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`getByIdProductsDependencies`).
 * 2. Recibe el `productId` como `string` para buscar el producto.
 * 3. Retorna una promesa con el producto encontrado o `null` si no existe.
 */
export type getByIdProductsType = (
  event: getByIdProductsDependencies,
  input: string,
) => Promise<any>;
