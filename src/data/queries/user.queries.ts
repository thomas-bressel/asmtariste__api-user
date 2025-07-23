import { UserBaseQueries } from "./user.base.queries";

export class UserQueries extends UserBaseQueries {

    public getAllUsers(): string {
        return this.getAllUsersQuery();
    }

    public getAllUsersWithRole(): string {
        return this.getAllUsersWithRoleQuery();
    }

    public getUserByNickname(): string {
        return this.getUserByNicknameQuery();
    }

    public createUser(): string {
        return this.createUserQuery();
    }

    public isNicknameExists(): string {
        return this.isNicknameExistsQuery();
    }

    public isEmailExists(): string {
        return this.isEmailExistsQuery();
    }

}