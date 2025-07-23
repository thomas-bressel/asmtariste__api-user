import PermissionRepository from "../repositories/permission.repository";
import PermissionResponseDto from "../dtos/permission.dto";
import PermissionEntity from "../../domain/entities/permission.entity";
import RoleService from "./role.service";
import Role from "src/domain/entities/role.entity";
import RoleResponseDto from "../dtos/role.dto";
class PermissionService {
  private permissionRepository: PermissionRepository;
  private roleService: RoleService;

  constructor(permissionRepository: PermissionRepository, roleService: RoleService) {
    this.permissionRepository = permissionRepository;
    this.roleService = roleService;
  }


  /**
   * Get all permission by a user uuid
   * @param uuid 
   * @returns 
   */
  public async getPermissionsByUserUuid(uuid: string): Promise<PermissionResponseDto[]> {
    try {
      // Repository returns entities
      const permissionEntities: PermissionEntity[] = await this.permissionRepository.getPermissionsByUserUuid(uuid);
      
      // Service transforms entities to DTOs
      return PermissionResponseDto.fromEntities(permissionEntities);
      
    } catch (error) {
      console.error("Erreur dans PermissionService:", error);
      throw error;
    }
  }

 



  /**
   * Get all permission with all roles
   * @returns 
   */
  public async getPermissionsByRole(): Promise<Role[]> {
    // Get all roles from the role service
    const roles = await this.roleService.getAllRoles();
  
    // Extract roles slugs for the repository
    const roleSlugs = roles.map(role => role.role_slug);
  
    const rolePermissions = await this.permissionRepository.getPermissionsByRole(roleSlugs);
  
    return rolePermissions;
  }


  



  /**
   * 
   * @param updates 
   * @returns 
   */
  public async updatePermissionsByRole( updates: { id_permission: number; role: string; hasPermission: boolean }[]): Promise<{ success: boolean, added: number, removed: number }[]> {

    // on recupère la liste des roles
    const roles = await this.roleService.getAllRoles();

    // Étape 2 : Utiliser la fonction filterRoleSlugById pour obtenir un dictionnaire role_slug -> id_role
    const roleDictionary = this.filterRoleSlugById(roles);

    // Étape 3 : Mappe les mises à jour des données originales avec leurs id_role
    const updatesWithRoleId = this.mapUpdatesWithRoleId(updates, roleDictionary);

    // Étape 4 : Passer les données associées au repository pour mise à jour
    const result = await this.permissionRepository.updatePermissionsByRole(updatesWithRoleId);
    return result;

  }



  /**
   * Filter Roles slug with their ids while associate role_slug to id role
   * @param roles 
   * @returns 
   */
  private filterRoleSlugById(roles : RoleResponseDto[] ): { [key: string]: number } {
    // Création d'un dictionnaire associant `role_slug` à `id_role`
    return roles.reduce((acc, role) => {
      acc[role.role_slug] = role.id_role;
      return acc;
    }, {} as { [key: string]: number });
  }



  /**
   * 
   * @param updates 
   * @param roleDictionary 
   * @returns 
   */
  private mapUpdatesWithRoleId(updates: { id_permission: number; role: string; hasPermission: boolean }[], roleDictionary: { [key: string]: number }): { id_permission: number; id_role: number; hasPermission: boolean }[] {
    return updates.map(update => {
      const id_role = roleDictionary[update.role];
      if (!id_role) {
        throw new Error(`Role "${update.role}" introuvable.`);
      }
  
      return {
        id_permission: update.id_permission,
        id_role: id_role,
        hasPermission: update.hasPermission
      };
    });
  }

}

export default PermissionService;
