import { productCreate, productResponse, UpdateProductInput } from '../models/ProductsMondels';

/**
 * Contrato del repositorio de productos.
 *
 * Define las operaciones necesarias para la persistencia,
 * consulta y modificación de productos en la capa de infraestructura.
 */
export interface ProductsRepository {
  /**
   * Crea un nuevo producto en el sistema.
   *
   * @param product - Datos del producto a crear (`productCreate`).
   * @returns Una promesa con el producto creado (`productResponse`).
   */
  createProduct(product: productCreate): Promise<productResponse>;

  /**
   * Obtiene un producto por su ID.
   *
   * @param productId - ID del producto.
   * @returns Una promesa con el producto encontrado o `null` si no existe.
   */
  getProductById(productId: string): Promise<productResponse | null>;

  /**
   * Lista todos los productos disponibles.
   *
   * @returns Una promesa con un arreglo de productos (`productResponse[]`).
   */
  listAll(): Promise<productResponse[]>;

  /**
   * Actualiza un producto existente.
   *
   * @param input - Datos de actualización (`UpdateProductInput`).
   * @returns Una promesa con el producto actualizado (`productCreate`).
   */
  updateProduct(input: UpdateProductInput): Promise<productCreate>;

  /**
   * Elimina un producto por su ID.
   *
   * @param productId - ID del producto a eliminar.
   * @returns Una promesa con un objeto que contiene el ID eliminado.
   */
  deleteProduct(productId: string): Promise<{ deleted: string }>;

  /**
   * Decrementa el stock de productos a partir de los ítems de una orden.
   *
   * @param items - Lista de ítems con `productId` y cantidad (`qty`) a decrementar.
   * @returns Una promesa que se resuelve cuando la operación finaliza.
   */
  decrementStockForOrderItems(items: { productId: string; qty: number }[]): Promise<void>;
}
