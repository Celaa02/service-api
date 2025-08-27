import { productCreate, productResponse } from '../models/ProductsMondels';

export interface ProductsRepository {
  createProduct(product: productCreate): Promise<productResponse>;
}
