import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

import { createOrders } from '../../domain/models/OrdersModelsHttp';
import { OrdersRepository } from '../../domain/repository/ordersRepository';
import { mapDynamoError } from '../../utils/mapDynamonError';
import { ddbDoc } from '../database/DynamonDB';

export class OrderRepositoryDynamoDB implements OrdersRepository {
  async createOrders(order: createOrders): Promise<any> {
    try {
      const now = new Date().toISOString();

      const item = {
        orderId: randomUUID(),
        userId: order.userId,
        createdAt: now,
        items: order.items,
      };

      await ddbDoc.send(
        new PutCommand({
          TableName: process.env.ORDERS_TABLE_NAME!,
          Item: item,
          ConditionExpression: 'attribute_not_exists(orderId)',
        }),
      );

      return item;
    } catch (err: any) {
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }
}
