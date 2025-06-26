/**
 * Middleware for handling permission validation.
 * 
 * @version 1.0.2
 * @author [Thomas Bressel]
 * @since 2025-01-01
 * 
 * @security This middleware validates user permissions by checking against
 * permissions stored in the database. It requires a valid user UUID from
 * the previous authentication middleware.
 * 
 * @remarks
 * - Requires the CSRF middleware to be executed first to populate res.locals
 * - Queries database for each permission check
 * - Supports granular permission checks
 */

// Express import
import { Request, Response, NextFunction } from "express";

// Database imports
import { createPool, Pool } from "mysql2/promise";
import MySQLUserConnexion from "../../infrastructure/database/mysql-user.connexion";
import { PermissionQueries } from "./permission.queries";


class PermissionMiddleware {
    private poolUser: Pool;

    constructor() {
        this.poolUser = createPool(MySQLUserConnexion.getDbConfig());
        
        // Bind methods
        this.check = this.check.bind(this);
    }


    /**
     * Check if database is reachable
     * @param poolType - Database pool
     * @returns boolean indicating if database is reachable
     */
    private async isDatabaseReachable(poolType: Pool): Promise<boolean> {
        try {
            if (!poolType) throw new Error("No database specified");
            const connection = await poolType.getConnection();
            connection.release();
            return true;
        } catch (error) {
            console.error("Database unreachable:", error);
            return false;
        }
    }



    /**
     * Main method to check if user has required permission.
     * @param requiredPermission - The permission code required for the route
     * @returns Express middleware function
     */
    public check(requiredPermission: string) {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                // Extract user UUID from res.locals (set by CSRF middleware)
                const userUuid = res.locals?.uuid;

                if (!userUuid) {
                    res.status(401).json({
                        error: 'User not authenticated',
                        code: 'AUTH_REQUIRED',
                        message: 'Please authenticate first'
                    });
                    return;
                }

                // Check if user has the required permission
                const userPermissions = await this.getPermissionsByUuid(userUuid);
                
                if (!this.hasPermission(userPermissions, requiredPermission)) {
                    res.status(403).json({
                        error: 'Insufficient permissions',
                        code: 'PERMISSION_DENIED',
                        message: `Permissions insufisantes pour accéder aux données`
                    });
                    return;
                }

                // Store permissions in res.locals for potential use in controllers
                res.locals.permissions = userPermissions;
                
                next();
            } catch (error) {
                console.error('Permission check error:', error);
                res.status(500).json({
                    error: 'Permission validation failed',
                    code: 'PERMISSION_CHECK_ERROR',
                    message: 'Unable to verify permissions'
                });
                return;
            }
        };
    }
  

    /**
     * Fetch user permissions from database by UUID
     * @param uuid - User UUID
     * @returns Array of permission codes
     */
    private async getPermissionsByUuid(id_user: string): Promise<string[]> {
        let connection;
        if (!(await this.isDatabaseReachable(this.poolUser))) throw new Error("DATABASE_UNREACHABLE");

        try {
            connection = await this.poolUser.getConnection();
            const [rows] = await connection.query<any[]>(PermissionQueries.getUserPermissionsByUuid(), [id_user]);
            return rows.map(row => row.code);
        } catch (error) {
            console.error("MySQL Error:", error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }


    /**
     * Check if user has a specific permission
     * @param userPermissions - Array of user permission codes
     * @param requiredPermission - Required permission code
     * @returns boolean
     */
    private hasPermission(userPermissions: string[], requiredPermission: string): boolean {
        return userPermissions.includes(requiredPermission);
    }
}

export default PermissionMiddleware;