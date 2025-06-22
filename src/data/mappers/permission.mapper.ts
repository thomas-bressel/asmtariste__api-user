import PermissionEntity from "../../domain/entities/permission.entity";

export class PermissionMapper {
  /**
   * Convert raw SQL rows to PermissionEntity array
   * Mapper peut être utilisé si logique de transformation complexe
   */
  static toEntities(rows: any[]): PermissionEntity[] {
    return rows.map(row => new PermissionEntity(
      row.id_permission,
      row.code,
      row.name,
      row.description,
      row.category
    ));
  }

  /**
   * Convert single raw SQL row to PermissionEntity
   */
  static toEntity(row: any): PermissionEntity {
    return new PermissionEntity(
      row.id_permission,
      row.code,
      row.name,
      row.description,
      row.category
    );
  }
}

export default PermissionMapper;