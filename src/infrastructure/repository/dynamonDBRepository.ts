import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import {
  confirmOrder,
  itemCreateOrder,
  orderByUser,
  orderListItem,
  orderListResponse,
  ordersByIdResponse,
} from '../../domain/models/OrdersModelsHttp';
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
