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


    protected static roleCaseStatement(slug: string): string {
        return `CASE WHEN SUM(CASE WHEN r.role_slug = '${slug}' THEN 1 ELSE 0 END) > 0 THEN '✅' ELSE '❌' END AS ${slug}`;
    }


    protected static getPermissionsByRoleQuery(roleCaseStatements: string): string {
        return ` SELECT
                      p.id_permission,
                      p.code, 
                      p.name AS permission_name,
                      p.description,
                      p.category,
                      ${roleCaseStatements}
                  FROM 
                    permission p
                  LEFT JOIN 
                    role_permission rp ON p.id_permission = rp.id_permission
                  LEFT JOIN 
                    role r ON rp.id_role = r.id_role
                  GROUP BY 
                    p.id_permission, p.name, p.description, p.category
                  ORDER BY 
                    p.id_permission, p.category, p.name`;
    }


    protected static insertPermissionQuery(): string {
        return `INSERT IGNORE INTO  role_permission (id_role, id_permission) VALUES ?`;
    }

    protected static deletePermissionQuery(): string {
        return `DELETE FROM role_permission WHERE (id_role, id_permission) IN (?)`;
    }


}