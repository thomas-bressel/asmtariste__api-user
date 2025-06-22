import PermissionEntity from '../../domain/entities/permission.entity';

export class PermissionResponseDto {
  public id_permission: number;
  public code: string;
  public name: string;
  public description: string | null;
  public category: string | null;

  constructor(
    id_permission: number,
    code: string,
    name: string,
    description: string | null,
    category: string | null
  ) {
    this.id_permission = id_permission;
    this.code = code;
    this.name = name;
    this.description = description;
    this.category = category;
  }

  // Méthode statique pour créer un DTO depuis une entité
  static fromEntity(permission: PermissionEntity): PermissionResponseDto {
    return new PermissionResponseDto(
      permission.id_permission,
      permission.code,
      permission.name,
      permission.description,
      permission.category
    );
  }

  // Méthode statique pour convertir une liste d'entités en DTOs
  static fromEntities(permissions: PermissionEntity[]): PermissionResponseDto[] {
    return permissions.map(permission => PermissionResponseDto.fromEntity(permission));
  }
}

export default PermissionResponseDto;