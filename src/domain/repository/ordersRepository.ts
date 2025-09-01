import {
  confirmOrder,
  createOrders,
  orderByUser,
  orderListResponse,
  ordersByIdResponse,
} from '../models/OrdersModels';

/**
 * Contrato del repositorio de órdenes.
 *
 * Define las operaciones necesarias para la persistencia y consulta
 * de órdenes en la capa de infraestructura.
 */
export interface OrdersRepository {
  /**
   * Crea una nueva orden en el sistema.
   *
   * @param order - Datos de la orden a crear (`createOrders`).
   * @returns Una promesa que se resuelve cuando la orden ha sido creada.
   */
  createOrders(order: createOrders): Promise<void>;

  /**
   * Obtiene una orden por su ID.
   *
   * @param order - ID de la orden.
   * @returns Una promesa con la orden encontrada o `null` si no existe.
   */
  getOrderById(order: string): Promise<ordersByIdResponse | null>;

  /**
   * Lista las órdenes de un usuario, con soporte para paginación.
   *
   * @param data - Parámetros de consulta (`orderByUser`), incluyendo `userId`, `limit` y opcionalmente `cursor`.
   * @returns Una promesa con un listado de órdenes (`orderListResponse`).
   */
  listOrdersByUser(data: orderByUser): Promise<orderListResponse>;

  /**
   * Confirma una orden existente (cambia su estado y asocia un pago).
   *
   * @param data - Información necesaria para confirmar la orden (`confirmOrder`).
   * @returns Una promesa con la orden confirmada o `null` si no pudo confirmarse.
   */
  confirmOrder(data: confirmOrder): Promise<ordersByIdResponse | null>;
}
