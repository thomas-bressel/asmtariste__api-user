import PermissionRepository from "../repositories/permission.repository";
import PermissionResponseDto from "../dtos/permission.dto";
import PermissionEntity from "../../domain/entities/permission.entity";

class PermissionService {
  private permissionRepository: PermissionRepository;

  constructor(permissionRepository: PermissionRepository) {
    this.permissionRepository = permissionRepository;
  }


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

 
  

}

export default PermissionService;
