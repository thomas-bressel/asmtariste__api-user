export abstract class UserBaseQueries {

    protected getAllUsersQuery(): string {
        return `SELECT * FROM users`;
    }


}