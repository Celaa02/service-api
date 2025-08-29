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

export type UpdateProductInput = Partial<Omit<productCreate, 'productId'>> & { productId: string };
