import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class WoocommerceService {
  constructor(private readonly httpService: HttpService) {}

  async getProducts(perPage = 10, page = 1) {
    console.log('page');
    console.log(page);
    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`,
          {
            auth: {
              username: process.env.WOOCOMMERCE_USER,
              password: process.env.WOOCOMMERCE_PASSWORD,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }

  async getProductVariations(productId: string, page = 1, perPage = 50) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products/${productId}/variations?per_page=${perPage}&page=${page}`,
          {
            auth: {
              username: process.env.WOOCOMMERCE_USER,
              password: process.env.WOOCOMMERCE_PASSWORD,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }

  async updateVariations(
    productId: string,
    variations: {
      id: number;
      stock_quantity: number;
    }[],
  ) {
    console.log('update variations');
    console.log(productId);
    console.log(variations);
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products/${productId}/variations/batch`,
          {
            update: variations,
          },
          {
            auth: {
              username: process.env.WOOCOMMERCE_USER,
              password: process.env.WOOCOMMERCE_PASSWORD,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return data;
  }
}
