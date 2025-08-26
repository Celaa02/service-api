import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { itemCreateOrder, orderByIdResponse } from '../../domain/models/OrdersModelsHttp';
import { OrdersRepository } from '../../domain/repository/ordersRepository';
import { mapDynamoError } from '../../utils/mapDynamonError';
import { ddbDoc } from '../database/DynamonDB';

export class OrderRepositoryDynamoDB implements OrdersRepository {
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

  async getOrderById(orderId: string): Promise<orderByIdResponse | null> {
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
}
