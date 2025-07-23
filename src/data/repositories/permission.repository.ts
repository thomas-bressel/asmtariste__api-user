import MySQLUserModule from "../../infrastructure/database/mysql-user.connexion";
import { createPool, Pool } from "mysql2/promise";
import { PermissionQueries } from "../queries/permission.queries";
import PermissionEntity from "../../domain/entities/permission.entity";
import { PermissionMapper } from "../mappers/permission.mapper";
import Role from "src/domain/entities/role.entity";


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
  public async getPermissionsByRole(roleSlugs: string[]): Promise<Role[]> {
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



/**
 * Update permissions by role
 * @param updates 
 * @returns 
 */
  public async updatePermissionsByRole(updates: { id_permission: number; id_role: number; hasPermission: boolean }[]): Promise<{ success: boolean, added: number, removed: number }[]> {
    let connection;
    if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");
  
    try {
      connection = await this.poolUser.getConnection();
      await connection.beginTransaction();
  
      const inserts: [number, number][] = [];
      const deletes: [number, number][] = [];
  
      for (const update of updates) {
        if (update.hasPermission) {
          inserts.push([update.id_role, update.id_permission]);
        } else {
          deletes.push([update.id_role, update.id_permission]);
        }
      }
  
      // INSERT IGNORE pour éviter les doublons
      if (inserts.length > 0) {
        await connection.query(PermissionQueries.insertPermission(), [inserts]);
      }
  
      // DELETE WHERE IN pour les suppressions groupées
      if (deletes.length > 0) { 
        await connection.query(PermissionQueries.deletePermission(), [deletes]);
      }
  
      await connection.commit();
      return [{ success: true, added: inserts.length, removed: deletes.length }];
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Erreur MySQL:", error);
      throw new Error("DATABASE_ERROR");
    } finally {
      if (connection) connection.release();
    }
  }

}

export default PermissionRepository;
