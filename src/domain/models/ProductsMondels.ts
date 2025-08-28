export interface productCreate {
  productId: string;
  name: string;
  price: number;
  stock?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface productResponse {
  productId: string;
  name: string;
  price: number;
  stock?: number;
  status?: string;
  createdAt: string;
}

export interface ProductListItem {
  productId: string;
  name: string;
  price: number;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface ProductListResponse {
  items: ProductListItem[];
  nextCursor?: string;
}

export interface listProduct {
  limit: number;
  cursor?: string;
}
