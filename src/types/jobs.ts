export type ProductsListJob = {
  page: number;
};

export type StockUpdateJob = {
  productId: string;
  variantsCount: number;
};
