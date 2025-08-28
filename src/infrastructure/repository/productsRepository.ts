import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

import { productCreate, productResponse } from '../../domain/models/ProductsMondels';
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
}
