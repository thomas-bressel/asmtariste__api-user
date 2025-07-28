import MySQLUserConnexion from "../../infrastructure/database/mysql-user.connexion";
import RedisConnection from "../../infrastructure/cache/redis.connection"

import { createPool, Pool, ResultSetHeader } from "mysql2/promise";
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
      if (!rows || rows.length === 0) throw new Error("Aucun utilisateur trouvé");
      return rows;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }





  /**
   * Get the list of all user from de database
   * @param uuid 
   * @returns 
   */
  public async getUserByUuid(uuid: string): Promise<User> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.getUserByUuid(), [uuid]);
      if (!rows || rows.length === 0) throw new Error("Aucun utilisateur trouvé avec cet uuid");
      return rows[0];

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





/**
 * Get all active session uuid users in cache memory 
 * @returns 
 */
  public async getAllActiveUserUuid(): Promise<string[]> {
    const redisClient = RedisConnection.getClient;
  
    try {
      if (!redisClient.isOpen) await RedisConnection.connect();
  
      // Récupérer toutes les clés qui commencent par "user:" et finissent par ":session"
      const userSessionKeys = await redisClient.keys('user:*:session');
      
      // Extraire les UUID des clés
      const uuids = userSessionKeys.map(key => {
        // key format: "user:UUID:session"
        const parts = key.split(':');
        return parts[1]; // L'UUID est entre les deux ":"
      });
      
      return uuids;
  
    } catch (error) {
      console.error("Error getting all active sessions:", error);
      return [];
    }
  }



  /**
   * Method to Delete Session if User has an active session
   * @param uuid 
   * @returns 
   */
  public async deleteSession(uuid: string): Promise<boolean> {
    const redisClient = RedisConnection.getClient;

    try {
      if (!redisClient.isOpen) await RedisConnection.connect();

      // Check is user have an active session
      const sessionId = await redisClient.get(`user:${uuid}:session`);

      const deleteSession = await redisClient.del(`session:${sessionId}`);
      if (!deleteSession) return false;

      const deleteUuid = await redisClient.del(`user:${uuid}:session`);
      if (!deleteUuid) return false;

      return true;

    } catch (error) {
      console.error("Error checking user active session:", error);
      // Considere is not deconnected
      return false;
    }
  }



  /**
   * Add a new user into database
   * @param createNewUser 
   * @returns 
   */
  public async createUser(createNewUser: User): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.createUser(), [
        createNewUser.uuid,
        createNewUser.nickname,
        createNewUser.firstname,
        createNewUser.lastname,
        createNewUser.email,
        createNewUser.hash_password,
        createNewUser.avatar,
        createNewUser.is_activated,
        createNewUser.id_role,
      ]);
      if (!rows || rows.length === 0) return false;
      return true;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }

  }




  /**
   * Check if the nickname already exist in database
   * @param nickname 
   * @returns 
   */
  public async isNicknameExists(nickname: string, uuid?: string): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();


      // If not uuid then the query checks if nickname existe anywhere user table
      if (!uuid) {
        const [rows] = await connection.query<any[]>(this.userQueries.isNicknameExists(), [nickname]);
        if (!rows || rows.length === 0) return false;
        return true;
      }

      // If uuid and nickname both exist, then the query check if nickname exist anywhere but the uuid row data
      if (uuid && nickname) {
        const [rows] = await connection.query<any[]>(this.userQueries.isNicknameExistsButUuidRow(), [nickname, uuid]);
        if (!rows || rows.length === 0) return false;
        return true;
      } 
      return false;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }





  /**
   * Check if the email already exist in database
   * @param email 
   * @returns 
   */
  public async isEmailExists(email: string, uuid?: string): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();

      // If not uuid : then the query checks if email existe anywhere user table
      if (!uuid) {
        const [rows] = await connection.query<any[]>(this.userQueries.isEmailExists(), [email]);
        if (!rows || rows.length === 0) return false;
        return true;
      }

      // If uuid and email both exist : then the query check if email exist anywhere but the uuid row data
      if (uuid && email) {
        const [rows] = await connection.query<any[]>(this.userQueries.isEmailExistsButUuidRow(), [email, uuid]);
        if (!rows || rows.length === 0) return false;
        return true;
      } 
      return false;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }

  }





  /**
   * Toggle the activation of the user account
   * @param uuid 
   * @returns true or false depending on the value in affectedRows key
   */
  public async toggleActivate(uuid: string): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [result] = await connection.query<ResultSetHeader>(this.userQueries.toggleActivate(), [uuid]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw new Error("DATABASE_ERROR");
    } finally {
      if (connection) connection.release();
    }
  }






  /**
   * 
   * @param uuid 
   * @returns 
   */
  public async ghostUser(uuid: string): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.ghostUser(), [uuid]);
      if (!rows || rows.length === 0) return false;
      return true;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }

  }






  /**
   * 
   * @param uuid 
   * @returns 
   */
  public async deleteUser(uuid: string): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.deleteUser(), [uuid]);
      if (!rows || rows.length === 0) return false;
      return true;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }

  }





  /**
   * 
   * @param dataUser 
   * @returns 
   */
  public async updateUser(dataUser: User): Promise<boolean> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.userQueries.updateUser(), [
        dataUser.nickname, 
        dataUser.firstname, 
        dataUser.lastname, 
        dataUser.email, 
        dataUser.avatar, 
        dataUser.id_role,
        dataUser.uuid
      ]);
      if (!rows || rows.length === 0) return false;
      return true;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }

  }

}

export default UserRepository;
