import { UserBaseQueries } from "./user.base.queries";

export class UserQueries extends UserBaseQueries {

    public getAllUsers() {
        return this.getAllUsersQuery();
    }

    public getAllUsersWithRole() {
        return this.getAllUsersWithRoleQuery();
    }

    public getUserByNickname() {
        return this.getUserByNicknameQuery();
    }

}