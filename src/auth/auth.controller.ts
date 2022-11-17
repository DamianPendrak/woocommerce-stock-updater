import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('access-token')
  async getAccessToken(): Promise<string> {
    return this.authService.getAccessToken().then((response) => {
      return response;
    });
  }
}
