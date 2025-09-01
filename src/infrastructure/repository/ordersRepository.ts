import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import {
  confirmOrder,
  itemCreateOrder,
  orderByUser,
  orderListItem,
  orderListResponse,
  ordersByIdResponse,
} from '../../domain/models/OrdersModels';
import { OrdersRepository } from '../../domain/repository/ordersRepository';
import { mapDynamoError } from '../../utils/mapDynamonError';
import { ddbDoc } from '../database/DynamonDB';

/**
 * Implementación de OrdersRepository usando DynamoDB (AWS SDK v3).
 *
 * Requiere las siguientes variables de entorno:
 * - ORDERS_TABLE_NAME: nombre de la tabla de órdenes.
 *
 * Índices:
 * - UserOrdersIndex: GSI para consultar órdenes por userId (usado en listOrdersByUser).
 */
export class OrderRepositoryDynamoDB implements OrdersRepository {
  /**
   * Crea una orden si no existe `orderId` (condición de unicidad).
   * @param order Orden ya construida (con orderId, createdAt, etc.)
   * @returns La orden insertada
   */
  async createOrders(order: itemCreateOrder): Promise<any> {
    try {
      await ddbDoc.send(
        new PutCommand({
          TableName: process.env.ORDERS_TABLE_NAME!,
          Item: order,
          ConditionExpression: 'attribute_not_exists(orderId)',
        }),
      );

      return order;
    } catch (err: any) {
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }

  /**
   * Obtiene una orden por ID solo si está en estado CONFIRMED.
   * @param orderId ID de la orden
   * @returns Detalle de la orden o null si no existe / no está confirmada
   */
  async getOrderById(orderId: string): Promise<ordersByIdResponse | null> {
    try {
      const res = await ddbDoc.send(
        new GetCommand({
          TableName: process.env.ORDERS_TABLE_NAME!,
          Key: { orderId },
        }),
      );

      if (!res.Item) return null;

      const item = res.Item as itemCreateOrder;

      if (item.status !== 'CONFIRMED') return null;

      return {
        orderId: item.orderId,
        userId: item.userId,
        items: item.items ?? [],
        total: item.total ?? 0,
        createdAt: item.createdAt,
        status: item.status,
      };
    } catch (err: any) {
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }

  /**
   * Lista órdenes por usuario con paginación (GSI UserOrdersIndex).
   * El cursor va en Base64 del LastEvaluatedKey.
   * @param data userId, limit y cursor opcional
   * @returns items resumidos + nextCursor (si hay más)
   */
  async listOrdersByUser(data: orderByUser): Promise<orderListResponse> {
    try {
      const params: any = {
        TableName: process.env.ORDERS_TABLE_NAME!,
        IndexName: 'UserOrdersIndex',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': data.userId },
        ScanIndexForward: false,
        Limit: data.limit,
      };

      if (data.cursor) {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(data.cursor, 'base64').toString('utf8'));
      }

      const res = await ddbDoc.send(new QueryCommand(params));

      const items: orderListItem[] = (res.Items ?? []).map((it: any) => ({
        id: it.orderId,
        total: it.total ?? 0,
        createdAt: it.createdAt,
        status: it.status ?? 'PENDING',
      }));

      const nextCursor = res.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(res.LastEvaluatedKey)).toString('base64')
        : undefined;

      return { items, nextCursor };
    } catch (err: any) {
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }

  /**
   * Confirma una orden en estado CREATED y guarda el paymentId.
   * Usa Update con ConditionExpression para garantizar consistencia.
   * @param data { orderId, paymentId }
   * @returns Orden confirmada o null si la condición falla
   */
  async confirmOrder(data: confirmOrder): Promise<ordersByIdResponse | null> {
    try {
      const orderId = data.orderId;

      const res = await ddbDoc.send(
        new UpdateCommand({
          TableName: process.env.ORDERS_TABLE_NAME!,
          Key: { orderId },
          ConditionExpression: 'attribute_exists(orderId) AND #status = :created',
          UpdateExpression: 'SET #status = :confirmed, #paymentId = :pid',
          ExpressionAttributeNames: {
            '#status': 'status',
            '#paymentId': 'paymentId',
          },
          ExpressionAttributeValues: {
            ':created': 'CREATED',
            ':confirmed': 'CONFIRMED',
            ':pid': data.paymentId,
          },
          ReturnValues: 'ALL_NEW',
        }),
      );

      const item = res.Attributes as itemCreateOrder;

      return {
        orderId: item.orderId,
        userId: item.userId,
        items: item.items ?? [],
        total: item.total ?? 0,
        createdAt: item.createdAt,
        status: item.status,
        paymentId: (item as any).paymentId,
      } as unknown as ordersByIdResponse;
    } catch (err: any) {
      if (err?.name === 'ConditionalCheckFailedException') {
        return null;
      }
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }
}
