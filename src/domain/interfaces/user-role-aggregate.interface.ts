import User from "../entities/user.entity";
import Role from "../entities/role.entity";

class UserRole {
    constructor(
      public readonly user: User,
      public readonly role: Role
    ) {}


    /**
     * Create an object with User and Role Data
     * @param rawData 
     * @returns a new object with a user key and a role key
     */
    static userRoleToDTO(rawData: any): UserRole {
      const user = new User(
        rawData.id_user,
        rawData.uuid,
        rawData.nickname,
        rawData.email,
        rawData.hash_password,
        rawData.firstname,
        rawData.lastname,
        rawData.avatar,
        rawData.registration_date,
        rawData.last_login,
        rawData.is_activated,
        rawData.id_role
      );
  
      const role = new Role(
        rawData.id_role,
        rawData.role_name,
        rawData.role_slug,
        rawData.role_color,
        rawData.canAccess
      );
  
      return new UserRole(user, role);
    }


    /**
     * Select the properties to show with User and Role properties
     * @returns 
     */
    toFlatObject(): Record<string, any> {
      const userData = { ...this.user };
      const roleData = { ...this.role };
    
      return {
        
        id_user: userData.id_user,
        uuid: userData.uuid,
        nickname: userData.nickname,
        email: userData.email,
        hash_password: userData.hash_password,
        firstname: userData.firstname,
        lastname: userData.lastname,
        avatar: userData.avatar,
        registration_date: userData.registration_date,
        last_login: userData.last_login,
        is_activated: userData.is_activated,
    
        id_role: roleData.id_role,
        role_name: roleData.role_name,
        role_slug: roleData.role_slug,
        role_color: roleData.role_color,
        canAccess: roleData.canAccess,
      };
    }
    
    

  }

  export default UserRole;