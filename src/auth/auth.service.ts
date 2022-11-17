import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { firstValueFrom, catchError } from 'rxjs';
import { ApiAuthLoginResponse } from './types/auth';
import { AxiosError } from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAccessToken(): Promise<string> {
    const accessToken = await this.cacheManager.get<string>('accessToken');

    if (accessToken) {
      return accessToken;
    }

    const refreshToken = await this.cacheManager.get<string>('refreshToken');

    if (refreshToken) {
      const { data: responseData } = await firstValueFrom(
        this.httpService
          .post<ApiAuthLoginResponse>(
            `${process.env.MALFINI_API_URL}v4/api-auth/refresh`,
            {
              refreshToken,
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.log(error);
              this.cacheManager.del('refreshToken');
              throw 'Token refresh error';
            }),
          ),
      );

      if (responseData?.access_token && responseData?.refresh_token) {
        await this.cacheManager.set(
          'accessToken',
          responseData?.access_token,
          25 * 60 * 1000,
        );
        await this.cacheManager.set(
          'refreshToken',
          responseData?.refresh_token,
          28 * 60 * 1000,
        );

        return responseData.access_token;
      }
    }

    const { data: responseData } = await firstValueFrom(
      this.httpService
        .post<ApiAuthLoginResponse>(
          `${process.env.MALFINI_API_URL}v4/api-auth/login`,
          {
            username: process.env.MALFINI_USER,
            password: process.env.MALFINI_PASSWORD,
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error);
            throw 'Login error';
          }),
        ),
    );

    if (responseData?.access_token && responseData?.refresh_token) {
      await this.cacheManager.set(
        'accessToken',
        responseData?.access_token,
        25 * 60 * 1000,
      );
      await this.cacheManager.set(
        'refreshToken',
        responseData?.refresh_token,
        28 * 60 * 1000,
      );

      return responseData.access_token;
    }
  }
}
