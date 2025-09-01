import { createProductsDependencies } from './CreateProductsDepencies';
import { productCreate } from '../../domain/models/ProductsMondels';

/**
 * Tipo que define la firma del caso de uso `createProducts`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`createProductsDependencies`).
 * 2. Recibe el input con la información del producto a crear (`productCreate`).
 * 3. Retorna una promesa con el resultado del proceso de creación.
 */
export type createProductsType = (
  event: createProductsDependencies,
  input: productCreate,
) => Promise<any>;
