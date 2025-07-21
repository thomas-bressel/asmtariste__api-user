import MySQLUserModule from "../../infrastructure/database/mysql-user.connexion";
import { createPool, Pool } from "mysql2/promise";
import { PermissionQueries } from "../queries/permission.queries";
import PermissionEntity from "../../domain/entities/permission.entity";
import { PermissionMapper } from "../mappers/permission.mapper";


class PermissionRepository {
  private poolUser: Pool;
  private permissionQueries: PermissionQueries;

  constructor() {
    this.poolUser = createPool(MySQLUserModule.getDbConfig());
    this.permissionQueries = new PermissionQueries();
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
   * Get permission list from database depends of user uuid
   * @param uuid 
   * @returns 
   */
  public async getPermissionsByUserUuid(uuid: string): Promise<PermissionEntity[]> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();
      const [rows] = await connection.query<any[]>(this.permissionQueries.getPermissionsByUserUuid(), [uuid]);
      return rows;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }





  /**
   * 
   * @param roleSlugs 
   * @returns 
   */
  public async getPermissionsByRole(roleSlugs: string[]): Promise<any[]> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

    try {
      connection = await this.poolUser.getConnection();

      // Building a dynamic query depending the received roles
      const roleCaseStatements = roleSlugs.map(slug => {
        return PermissionQueries.buldRoleCaseStatement(slug);
      }).join(", ");
      
      const query = PermissionQueries.getPermissionsByRole(roleCaseStatements);

      const [rows] = await connection.query<any[]>(query);
      return rows;
    } catch (error) {
      console.error("Erreur MySQL:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }





}

export default PermissionRepository;
