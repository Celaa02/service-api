import { productCreate, productResponse } from '../models/ProductsMondels';

export interface ProductsRepository {
  createProduct(product: productCreate): Promise<productResponse>;
  getProductById(productId: string): Promise<productResponse | null>;
  listAll(): Promise<productResponse[]>;
}
