import User  from '../../domain/entities/user.entity';
import Role from '../../domain/entities/role.entity';

export class UserRoleResponseDTO {
    constructor(
      public uuid: string,
      public nickname: string,
      public email: string,
      public firstname: string | undefined,
      public lastname: string | undefined,
      public avatar: string,
      public registration_date: Date,
      public last_login: Date,
      public is_activated: boolean,
      public role_name: string,
      public role_color: string,
    ) {}
  

    /**
     * Method to convert an aggregated Entity into a DTO
     * @param user 
     * @param role 
     * @returns 
     */
    static fromEntityWithRole(user: User, role: Role): UserRoleResponseDTO {
      return new UserRoleResponseDTO(
        user.uuid,
        user.nickname,
        user.email,
        user.firstname,
        user.lastname,
        user.avatar,
        user.registration_date,
        user.last_login,
        user.is_activated,
        role.role_name,
        role.role_color,
      );
    }


    /**
   * Convert an array of UserRole data into DTOs
   * @param usersWithRoleData 
   * @returns 
   */
  static fromEntitiesWithRole(usersWithRoleData: any[]): UserRoleResponseDTO[] {
    return usersWithRoleData.map(userRole => 
      this.fromEntityWithRole(userRole.user, userRole.role)
    );
  }


  /**
     * Method to convert a list of User + Role into a DTO
     * @param rawData 
     * @returns 
     */
  static toUserWithRoleDTOs(rawData: unknown[]): UserRoleResponseDTO[] {
    return (rawData as any[]).map(row => new UserRoleResponseDTO(
      row.uuid,
      row.nickname,
      row.email,
      row.firstname,
      row.lastname,
      row.avatar,
      row.registration_date,
      row.last_login,
      row.is_activated,
      row.role_name,
      row.role_color
    ));
  }

  }
  