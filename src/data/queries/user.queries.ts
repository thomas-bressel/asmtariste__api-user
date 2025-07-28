import { UserBaseQueries } from "./user.base.queries";

export class UserQueries extends UserBaseQueries {

    public getAllUsers(): string {
        return this.getAllUsersQuery();
    }
    public getUserByUuid(): string {
        return this.getUserByUuidQuery();
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
    public isNicknameExistsButUuidRow(): string {
        return this.isNicknameExistsButUuidRowQuery();
    }

    public isEmailExists(): string {
        return this.isEmailExistsQuery();
    }
    public isEmailExistsButUuidRow(): string {
        return this.isEmailExistsButUuidRowQuery();
    }
    public toggleActivate(): string {
        return this.toggleActivateQuery();
    }

    public ghostUser(): string {
        return this.ghostUserQuery();
    }

    public deleteUser(): string {
        return this.deleteUserQuery();
    }

    public updateUser(): string {
        return this.updateUserQuery();
    }

}