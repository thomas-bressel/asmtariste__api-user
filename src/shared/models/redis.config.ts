export interface RedisConfigModel {
    expiration: number;
    host: string;
    port: number;
    password?: string; 
  }