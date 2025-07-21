import PermissionRepository from "../repositories/permission.repository";
import PermissionResponseDto from "../dtos/permission.dto";
import PermissionEntity from "../../domain/entities/permission.entity";
import RoleService from "./role.service";

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
   * 
   * @returns 
   */
  public async getPermissionsByRole(): Promise<any[]> {
    // Get all roles from the role service
    const roles: any[] = await this.roleService.getAllRoles();
  
    // Extract roles slugs for the repository
    const roleSlugs = roles.map(role => role.role_slug);
  
    const rolePermissions = await this.permissionRepository.getPermissionsByRole(roleSlugs);
  
    return rolePermissions;
  }


  

}

export default PermissionService;
