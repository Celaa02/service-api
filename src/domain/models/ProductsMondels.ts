export interface productCreate {
  productId: string;
  name: string;
  price: number;
  stock?: number;
  createdAt: string;
}

export interface productResponse {
  productId: string;
  name: string;
  price: number;
  stock?: number;
  createdAt: string;
}
