import { listProductsDependencies } from './listProductsDepencies';

/**
 * Tipo que define la firma del caso de uso `listProducts`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`listProductsDependencies`).
 * 2. No recibe un input adicional, ya que solo lista todos los productos.
 * 3. Retorna una promesa con la lista de productos disponibles.
 */
export type listProductsType = (event: listProductsDependencies) => Promise<any>;
