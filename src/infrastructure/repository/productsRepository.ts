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

/**
 * Implementación de ProductsRepository usando DynamoDB (AWS SDK v3).
 *
 * Requiere:
 * - PRODUCTS_TABLE_NAME: nombre de la tabla de productos (env).
 */
export class ProductRepositoryDynamoDB implements ProductsRepository {
  /**
   * Crea un producto si no existe `productId` (condición de unicidad).
   * @param input Datos del producto
   * @returns El producto creado normalizado
   */
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

  /**
   * Obtiene un producto por ID.
   * @param productId ID del producto
   * @returns `productResponse` o `null` si no existe
   */
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

  /**
   * Lista todos los productos.
   * (Considera paginación si esperas tablas grandes)
   * @returns Arreglo de productos normalizados
   */
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

  /**
   * Actualiza campos parciales de un producto por ID.
   * Construye dinámicamente la UpdateExpression en base a `input`.
   * @param input `{ productId, ...patch }`
   * @returns Atributos actualizados del producto
   */
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

  /**
   * Elimina un producto por ID (con condición de existencia).
   * @param productId ID a eliminar
   * @returns Objeto con el ID eliminado
   */
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

  /**
   * Decrementa stock de un producto (chequea existencia y stock suficiente).
   * @param productId ID del producto
   * @param qty Cantidad a descontar
   */
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

  /**
   * Decrementa stock para cada ítem de una orden.
   * (Ejecución secuencial; considera lote/paralelo si aplica)
   * @param items Lista de { productId, qty }
   */
  async decrementStockForOrderItems(items: { productId: string; qty: number }[]): Promise<void> {
    for (const { productId, qty } of items) {
      await this.decrementStock(productId, qty);
    }
  }
}
