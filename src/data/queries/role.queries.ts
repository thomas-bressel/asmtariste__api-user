import { RoleBaseQueries } from "./role.base.queries";

export class RoleQueries extends RoleBaseQueries {

    public getAllRoles() {
        return this.getAllRolesQuery();
    }

 

}