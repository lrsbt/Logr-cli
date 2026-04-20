export interface Config {
  api_key: string;
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    api_key: string;
  };
}
