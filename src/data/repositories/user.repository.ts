import MySQLUserConnexion from "../../infrastructure/database/mysql-user.connexion";
import RedisConnection from "../../infrastructure/cache/redis.connection"

import { createPool, Pool } from "mysql2/promise";
import { UserQueries } from "../../data/queries/user.queries";
import User from "../../domain/entities/user.entity";


class UserRepository {
  private poolUser: Pool;
  private userQueries: UserQueries;

  constructor() {
    this.poolUser = createPool(MySQLUserConnexion.getDbConfig());
    this.userQueries = new UserQueries();
  }


  private async isDatabaseReachable(poolType: Pool): Promise<boolean> {
    try {

      if (!poolType) throw new Error("No database specified");
      const connection = await poolType.getConnection();
      connection.release();
      return true;
    } catch (error) {
      console.error("Database unreachable:", error);
      return false;
    }
  }

  
  /**
   * Get the list of all user from de database
   * @returns 
   */
  public async getAllUsers(): Promise<User[]> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.getAllUsers());
      if (!rows || rows.length === 0) throw new Error("No users found");
      return rows;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }




  /**
   * Get the list of all user from de database the the content of their role
   * @returns 
   */
  public async getAllUsersWithRole(): Promise<unknown[]> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.getAllUsersWithRole());
      if (!rows || rows.length === 0) throw new Error("No users found");
      return rows;

    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }





  /**
   * Get information of a unique user by its nickname
   * @param nickname 
   * @returns 
   */
  public async getUserByNickname(nickname: string): Promise<unknown> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.getUserByNickname(), [nickname]);
      if (!rows || rows.length === 0) throw new Error("Repo: Aucun utilisateur trouvé avec ce pseudo");
      return rows[0];

    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;

    } finally {
      if (connection) connection.release();
    }

  }



  /**
   * 
   * @param id_session 
   * @param id_user 
   * @returns 
   */
  public async storeSession(id_session: string, id_user: string): Promise<string | null> {
    const redisClient = RedisConnection.getClient;
    const expiration = RedisConnection.redisConfig.expiration;
    try {
      if (!redisClient.isOpen) await RedisConnection.connect();

      // Delete the old session before store another one
      const oldSessionId = await redisClient.get(`user:${id_user}:session`);
      if (oldSessionId && oldSessionId !== id_session) {
        await redisClient.del(`session:${oldSessionId}`);
        console.log(`Old session deleted : ${oldSessionId}`);
      }

      let result;
      if (expiration > 0) {
        result = await redisClient.setEx(`session:${id_session}`, expiration, id_user);
        await redisClient.setEx(`user:${id_user}:session`, expiration, id_session);
      } else {
        result = await redisClient.set(`session:${id_session}`, id_user);
        await redisClient.set(`user:${id_user}:session`, id_session);
      }

      return result;

    } catch (error) {
      console.error("Error session stocking:", error);
      throw error;
    }
  }


  /**
   * Method to Check is User has an active session
   * @param uuid 
   * @returns 
   */
  public async isUserConnected(uuid: string): Promise<boolean> {
    const redisClient = RedisConnection.getClient;

    try {
      if (!redisClient.isOpen) await RedisConnection.connect();

      // Check is user have an active session
      const sessionId = await redisClient.get(`user:${uuid}:session`);
      return sessionId !== null;

    } catch (error) {
      console.error("Error checking user connection:", error);
      // Considere is not connected
      return false;
    }
  }


}

export default UserRepository;
