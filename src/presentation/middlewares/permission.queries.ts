export class PermissionQueries {

    /**
     * Get all permission codes for a user by UUID
     * @returns 
     */
    public static getUserPermissionsByUuid(): string {
        return `
            SELECT DISTINCT
                p.code
            FROM 
                users u
            JOIN 
                role_permission rp ON u.id_role = rp.id_role
            JOIN 
                permission p ON rp.id_permission = p.id_permission
            WHERE 
                u.uuid = ? 
            AND
                u.is_activated = 1
        `;
    }
}