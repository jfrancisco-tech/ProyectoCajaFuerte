export interface User {
  id: number;
  usuario: string;
  email?: string;
  rol: 'admin' | 'usuario';
}

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
