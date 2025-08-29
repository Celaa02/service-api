import { productCreate, productResponse, UpdateProductInput } from '../models/ProductsMondels';

export interface ProductsRepository {
  createProduct(product: productCreate): Promise<productResponse>;
  getProductById(productId: string): Promise<productResponse | null>;
  listAll(): Promise<productResponse[]>;
  updateProduct(input: UpdateProductInput): Promise<productCreate>;
}
