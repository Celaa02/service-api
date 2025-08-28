import {
  listProduct,
  productCreate,
  ProductListResponse,
  productResponse,
} from '../models/ProductsMondels';

export interface ProductsRepository {
  createProduct(product: productCreate): Promise<productResponse>;
  getProductById(productId: string): Promise<productResponse | null>;
  listProducts(data: listProduct): Promise<ProductListResponse>;
}
