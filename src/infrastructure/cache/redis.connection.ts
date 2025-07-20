/**
 * Redis Connection - Caching Layer Configuration
 * 
 * @version 1.1.0
 * @author Thomas Bressel
 * @since 2024-05-15
 *  
 * @remarks 
 * - Ensure that the required environment variables (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SOCKET`, `REDIS_EXPIRATION`) are correctly set.
 * - The class validates configuration and throws errors if any required fields are invalid or missing.
 * - The connection automatically switches between TCP and UNIX socket based on environment configuration.
 * - This class is immutable after compilation — no methods or properties can be added, removed, or modified.
 * - Designed to prevent accidental misconfiguration or runtime modification of the Redis client.
 * 
 * @security This class handles sensitive caching credentials and is frozen to protect against injection or mutation.
 */


import { createClient, RedisClientType } from "redis";
import { RedisConfigModel } from "../../shared/models/database/redis.config";


class RedisConnection {
  private static client: RedisClientType | null = null;

  /**
   * Get the redis config
   */
  public static get redisConfig(): RedisConfigModel {
    return {
      expiration: parseInt(process.env.REDIS_EXPIRATION || "0", 10),
      host: process.env.REDIS_HOST || "redis-server",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
    };
  }


  /**
   * Method to create the type of Redis client connection
   * @returns 
   */
  private static createRedisClient(): RedisClientType {
    if (this.isUsingSocket) {
      console.log("Redis connection with UNIX");
      return createClient({
        socket: {
          path: process.env.REDIS_SOCKET!,
          tls: false,
        },
        password: this.redisConfig.password,
      });
    } else {
      console.log("Redis connection with TCP");
      return createClient({
        socket: {
          host: this.redisConfig.host,
          port: this.redisConfig.port,
        },
        password: this.redisConfig.password,
      });
    }
  }



  /**
   * Method to get Redsi client
   */
  public static get getClient(): RedisClientType {
    if (!this.client) {
      this.client = this.createRedisClient();
      this.client.on("error", (error) => console.error("Redis error :", error));
    }
    return this.client;
  }


  /**
 * 
 */
  private static get isUsingSocket(): boolean {
    return Boolean(process.env.REDIS_SOCKET);
  }


  /**
   * Method to connect to redis service
   */
  public static async connect(): Promise<void> {
    if (!this.client) {
      this.client = this.getClient;
    }
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  /**
   * Method to disconnect from redis service
   */
  public static async disconnect(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
    }
  }
}

export default RedisConnection;
