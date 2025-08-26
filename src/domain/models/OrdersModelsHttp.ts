export interface createOrders {
  userId: string;
  items: itemsOrders[];
  total: number;
  status: string;
}

interface itemsOrders {
  productId: string;
  qty: number;
}

export interface itemCreateOrder {
  orderId: string;
  userId: string;
  createdAt: string;
  items: itemsOrders[];
  status: string;
  total: number;
}

export interface orderByIdResponse {
  orderId: string;
  userId: string;
  items: itemsOrders[];
  total: number;
  createdAt: string;
  status: string;
}

export interface orderById {
  orderId: string;
}
