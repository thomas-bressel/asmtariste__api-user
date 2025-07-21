import RoleRepository from "../repositories/role.repository";
import Role from "../../domain/entities/role.entity";
import RoleResponseDto from "../dtos/role.dto";


class RoleService {
    private roleRepository: RoleRepository;

    constructor(roleRepository: RoleRepository) {
        this.roleRepository = roleRepository;
    }



    /**
     * Get all roles
     * @returns 
     */
    public async getAllRoles(): Promise<RoleResponseDto[]> {
        try {
            // Repository returns entities
            const roleEntities: Role[] = await this.roleRepository.getAllRoles();

            // Service transforms entities to DTOs
            return RoleResponseDto.fromEntities(roleEntities);

        } catch (error) {
            console.error("Erreur dans RoleService:", error);
            throw error;
        }
    }




}

export default RoleService;
