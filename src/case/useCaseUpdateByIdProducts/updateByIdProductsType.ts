import { updateByIdProductsDependencies } from './updateByIdProductsDepencies';
import { UpdateProductInput } from '../../domain/models/ProductsMondels';

/**
 * Tipo que define la firma del caso de uso `updateByIdProducts`.
 *
 * Representa una función asíncrona que:
 * 1. Recibe las dependencias necesarias (`updateByIdProductsDependencies`).
 * 2. Recibe el input con los datos a actualizar (`UpdateProductInput`).
 * 3. Retorna una promesa con el producto actualizado o `null` si no existe.
 */
export type updateByIdProductsType = (
  event: updateByIdProductsDependencies,
  input: UpdateProductInput,
) => Promise<any>;
