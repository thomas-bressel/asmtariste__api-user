export abstract class PermissionBaseQueries {

    protected getPermissionsByUserUuidQuery(): string {
        return `
            SELECT 
                p.*
            FROM 
                permission p
            JOIN 
                role_permission rp ON p.id_permission = rp.id_permission
            JOIN 
                role r ON r.id_role = rp.id_role
            JOIN 
                users u ON u.id_role = r.id_role
            WHERE 
                u.uuid = ?`;
    }


}