import { PermissionBaseQueries } from "./permission.base.queries";

export class PermissionQueries extends PermissionBaseQueries {

    public getPermissionsByUserUuid() {
        return this.getPermissionsByUserUuidQuery();
    }

}