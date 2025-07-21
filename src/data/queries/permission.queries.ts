import { PermissionBaseQueries } from "./permission.base.queries";

export class PermissionQueries extends PermissionBaseQueries {

    public getPermissionsByUserUuid() {
        return this.getPermissionsByUserUuidQuery();
    }

    public static buldRoleCaseStatement(slug: string): string {
        return this.roleCaseStatement(slug);
    }

    public static getPermissionsByRole(roleCaseStatements: string): string {
        return this.getPermissionsByRoleQuery(roleCaseStatements);
    }

}