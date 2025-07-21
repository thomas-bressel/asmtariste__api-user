export abstract class RoleBaseQueries {

    protected getAllRolesQuery(): string {
        return `SELECT *  FROM role`;
    }




}