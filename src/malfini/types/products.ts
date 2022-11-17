export type ProductAvailability = {
  quantity: number;
  date: Date;
  productSizeCode: string;
};

export type ProductPrice = {
  price: number;
  currency: string;
  limit: number;
  productSizeCode: string;
};
