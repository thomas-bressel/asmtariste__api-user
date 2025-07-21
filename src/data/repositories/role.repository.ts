import { createPool, Pool } from "mysql2/promise";
import MySQLUserConnexion from "../../infrastructure/database/mysql-user.connexion";

import Role from "src/domain/entities/role.entity";
import { RoleQueries } from "../queries/role.queries";

class RoleRepository {
  private poolUser: Pool;
  private roleQueries: RoleQueries;

  constructor() {
    this.poolUser = createPool(MySQLUserConnexion.getDbConfig());
    this.roleQueries = new RoleQueries();
  }


  /**
   * Database connection
   * @param poolType 
   * @returns 
   */
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
   * Get all roles from database
   * @returns 
   */
  public async getAllRoles(): Promise<Role[]> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.roleQueries.getAllRoles());
      return rows;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw new Error("DATABASE_ERROR");
    } finally {
      if (connection) connection.release();
    }
  }
}

export default RoleRepository;
