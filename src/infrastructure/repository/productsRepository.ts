import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import {
  productCreate,
  productResponse,
  UpdateProductInput,
} from '../../domain/models/ProductsMondels';
import { ProductsRepository } from '../../domain/repository/productsRepository';
import { mapDynamoError } from '../../utils/mapDynamonError';
import { ddbDoc } from '../database/DynamonDB';

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME!;

export class ProductRepositoryDynamoDB implements ProductsRepository {
  async createProduct(input: productCreate): Promise<productResponse> {
    try {
      await ddbDoc.send(
        new PutCommand({
          TableName: PRODUCTS_TABLE,
          Item: input,
          ConditionExpression: 'attribute_not_exists(productId)',
        }),
      );

      return {
        productId: input.productId,
        name: input.name,
        price: input.price,
        stock: input.stock,
        status: input.status ?? 'ACTIVE',
        createdAt: input.createdAt,
      };
    } catch (err: any) {
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }

  async getProductById(productId: string): Promise<productResponse | null> {
    try {
      const res = await ddbDoc.send(
        new GetCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId },
        }),
      );

      if (!res.Item) return null;

      const it = res.Item as productResponse;
      return {
        productId: it.productId,
        name: it.name,
        price: it.price,
        stock: it.stock,
        status: it.status ?? 'ACTIVE',
        createdAt: it.createdAt,
      };
    } catch (err: any) {
      console.error('RAW DynamoDB error =>', err);
      throw mapDynamoError(err);
    }
  }

  async listAll(): Promise<productResponse[]> {
    try {
      const res = await ddbDoc.send(
        new ScanCommand({
          TableName: PRODUCTS_TABLE,
        }),
      );
      return (res.Items as productResponse[]) ?? [];
    } catch (err: any) {
      throw mapDynamoError(err);
    }
  }

  async updateProduct(input: UpdateProductInput): Promise<productCreate> {
    const { productId, ...patch } = input;
    if (!productId) throw new Error('productId requerido');

    const sets: string[] = [];
    const values: Record<string, any> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      sets.push(`#${k} = :${k}`);
      values[`:${k}`] = v;
    }
    if (sets.length === 0) throw new Error('Nada para actualizar');

    const names = Object.keys(patch).reduce<Record<string, string>>((acc, k) => {
      acc[`#${k}`] = k;
      return acc;
    }, {});

    try {
      const res = await ddbDoc.send(
        new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId },
          UpdateExpression: `SET ${sets.join(', ')}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ConditionExpression: 'attribute_exists(productId)',
          ReturnValues: 'ALL_NEW',
        }),
      );
      return res.Attributes as productCreate;
    } catch (err: any) {
      throw mapDynamoError(err);
    }
  }

  async deleteProduct(productId: string): Promise<{ deleted: string }> {
    try {
      await ddbDoc.send(
        new DeleteCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId },
          ConditionExpression: 'attribute_exists(productId)',
        }),
      );
      return { deleted: productId };
    } catch (err: any) {
      throw mapDynamoError(err);
    }
  }

  async decrementStock(productId: string, qty: number): Promise<void> {
    try {
      await ddbDoc.send(
        new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { productId },
          UpdateExpression: 'SET stock = stock - :q',
          ConditionExpression: 'attribute_exists(productId) AND stock >= :q',
          ExpressionAttributeValues: { ':q': qty },
        }),
      );
    } catch (err: any) {
      throw mapDynamoError(err);
    }
  }

  async decrementStockForOrderItems(items: { productId: string; qty: number }[]): Promise<void> {
    for (const { productId, qty } of items) {
      await this.decrementStock(productId, qty);
    }
  }
}
