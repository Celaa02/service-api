import { PutCommand } from '@aws-sdk/lib-dynamodb';

import { itemCreateOrder } from '../../domain/models/OrdersModelsHttp';
import { OrdersRepository } from '../../domain/repository/ordersRepository';
import { mapDynamoError } from '../../utils/mapDynamonError';
import { ddbDoc } from '../database/DynamonDB';

export class OrderRepositoryDynamoDB implements OrdersRepository {
  async createOrders(order: itemCreateOrder): Promise<any> {
    console.log('🚀 ~ OrderRepositoryDynamoDB ~ createOrders ~ order:', order);
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
}
