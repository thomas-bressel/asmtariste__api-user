import MySQLUserConnection from "../../infrastructure/database/mysql-user.connection";
import { createPool, Pool } from "mysql2/promise";
import { UserQueries } from "../../data/queries/user.queries";
import User from "../../domain/entities/user.entity";


class UserRepository {
  private poolUser: Pool;
  private userQueries: UserQueries;

  constructor() {
    this.poolUser = createPool(MySQLUserConnection.getDbConfig());
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
      if (!rows || rows.length === 0) throw new Error("Aucun utilisateur trouvé avec ce pseudo");
      return rows[0];

    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;

    } finally {
      if (connection) connection.release();
    }

  }

}

export default UserRepository;
