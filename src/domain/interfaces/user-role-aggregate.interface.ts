import User from "../entities/user.entity";
import Role from "../entities/role.entity";

class UserRole {
    constructor(
      public readonly user: User,
      public readonly role: Role
    ) {}
  }

  export default UserRole;