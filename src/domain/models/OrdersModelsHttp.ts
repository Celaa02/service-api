export interface createOrders {
  userId: string;
  items: itemsOrders[];
}

interface itemsOrders {
  productId: string;
  qty: number;
}
