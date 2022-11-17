export interface ApiAuthLoginRequest {
  username: string;
  password: string;
}

export interface ApiAuthLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
