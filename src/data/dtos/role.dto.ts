import Role from '../../domain/entities/role.entity';

export class RoleResponseDto {
    public id_role: number;
    public role_name: string;
    public role_slug: string;
    public role_color: string;
    public canAccess: boolean;

    constructor(
        id_role: number,
        role_name: string,
        role_slug: string,
        role_color: string,
        canAccess: boolean
    ) {
        this.id_role = id_role;
        this.role_name = role_name;
        this.role_slug = role_slug;
        this.role_color = role_color;
        this.canAccess = canAccess;
    }


    /**
     * Create a DTO from an entity
     * @param role 
     * @returns 
     */
    static fromEntity(role: Role): RoleResponseDto {
        return new RoleResponseDto(
            role.id_role,
            role.role_name,
            role.role_slug,
            role.role_color,
            role.canAccess
        );
    }


    /**
     * Convert a role entity list into a DTO
     * @param roles 
     * @returns 
     */
    static fromEntities(roles: Role[]): RoleResponseDto[] {
        return roles.map(role => RoleResponseDto.fromEntity(role));
    }
}

export default RoleResponseDto;