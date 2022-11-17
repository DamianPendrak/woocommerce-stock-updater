import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ProductAvailability } from './types/products';
import { Cache } from 'cache-manager';

@Injectable()
export class MalfiniService {
  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getProductAvailabilities(): Promise<ProductAvailability[]> {
    const availabilities = await this.cacheManager.get<ProductAvailability[]>(
      'availabilities',
    );

    if (availabilities) {
      return availabilities;
    }

    const accessToken = await this.authService.getAccessToken();
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${process.env.MALFINI_API_URL}v4/product/availabilities`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((e) => {
            console.log(e);
            throw new HttpException(e.response.data, e.response.status);
          }),
        ),
    );
    await this.cacheManager.set('availabilities', data, 25 * 60 * 1000);
    return data;
  }
}
