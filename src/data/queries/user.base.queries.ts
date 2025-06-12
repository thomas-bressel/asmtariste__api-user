export abstract class UserBaseQueries {

    protected getAllUsersQuery(): string {
        return `SELECT * FROM users`;
    }

    protected getAllUsersWithRoleQuery(): string {
        return `SELECT  *  FROM users u 
                JOIN role r ON r.id_role = u.id_role ;`;
    }


}