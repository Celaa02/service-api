import {
  listProduct,
  productCreate,
  ProductListResponse,
  productResponse,
} from '../models/ProductsMondels';

export interface ProductsRepository {
  createProduct(product: productCreate): Promise<productResponse>;
  listProducts(data: listProduct): Promise<ProductListResponse>;
}
