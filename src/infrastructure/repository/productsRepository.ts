import { PutCommand } from '@aws-sdk/lib-dynamodb';

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
}
