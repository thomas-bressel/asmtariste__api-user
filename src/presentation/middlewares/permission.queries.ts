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
                _user u
            JOIN 
                to_permit tp ON u.id_role = tp.id_role
            JOIN 
                permission p ON tp.id_permission = p.id_permission
            WHERE 
                u.uuid = ? 
            AND
                u.is_activated = 1
        `;
    }
}