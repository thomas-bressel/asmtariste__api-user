import { Request, Response, NextFunction } from 'express';
import { Pool } from 'mysql2/promise';
import PermissionMiddleware from '../../src/presentation/middlewares/permission.middleware'
import MySQLUserConnexion from '../../src/infrastructure/database/mysql-user.connection';
import { PermissionQueries } from '../../src/presentation/middlewares/permission.queries';



jest.mock('mysql2/promise');
jest.mock('../../src/infrastructure/database/mysql-user.connection');
jest.mock('../../src/presentation/middlewares/permission.queries');

const mockCreatePool = require('mysql2/promise').createPool as jest.MockedFunction<typeof import('mysql2/promise').createPool>;
const mockMySQLUserConnexion = MySQLUserConnexion as jest.Mocked<typeof MySQLUserConnexion>;
const mockPermissionQueries = PermissionQueries as jest.Mocked<typeof PermissionQueries>;

describe('PermissionMiddleware', () => {
    let middleware: PermissionMiddleware;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockPool: jest.Mocked<Pool>;
    let mockConnection: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock de la connection
        mockConnection = {
            query: jest.fn(),
            release: jest.fn(),
            getConnection: jest.fn()
        };

        // Mock du pool
        mockPool = {
            getConnection: jest.fn().mockResolvedValue(mockConnection),
            execute: jest.fn(),
            query: jest.fn(),
            end: jest.fn()
        } as any;

        // Setup des mocks
        mockCreatePool.mockReturnValue(mockPool);
        mockMySQLUserConnexion.getDbConfig.mockReturnValue({
            host: 'localhost',
            user: 'test',
            password: 'test',
            database: 'test'
        });
        mockPermissionQueries.getUserPermissionsByUuid.mockReturnValue(
            `SELECT DISTINCT
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
                u.is_activated = 1`
        );

        middleware = new PermissionMiddleware();

        // Mock response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            locals: {}
        };

        mockNext = jest.fn();
        mockRequest = {};
    });




    describe('check', () => {
        it('should allow access when user has required permission', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';
            const userPermissions = [{ code: 'READ_USERS' }, { code: 'WRITE_POSTS' }];

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockResolvedValue([userPermissions]);

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.any(String),
                [userUuid]
            );
            expect(mockResponse.locals.permissions).toEqual(['READ_USERS', 'WRITE_POSTS']);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });




        it('should deny access when user lacks required permission', async () => {
            // Arrange
            const requiredPermission = 'DELETE_USERS';
            const userUuid = 'user-123';
            const userPermissions = [{ code: 'READ_USERS' }, { code: 'WRITE_POSTS' }];

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockResolvedValue([userPermissions]);

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Insufficient permissions',
                code: 'PERMISSION_DENIED',
                message: "Permission 'DELETE_USERS' is required for this action"
            });
            expect(mockNext).not.toHaveBeenCalled();
        });




        it('should deny access when user UUID is missing from res.locals', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            mockResponse.locals = {}; // Pas d'UUID

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'User not authenticated',
                code: 'AUTH_REQUIRED',
                message: 'Please authenticate first'
            });
            expect(mockConnection.query).not.toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalled();
        });




        it('should deny access when user has no permissions', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';
            const userPermissions: any[] = []; // Aucune permission

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockResolvedValue([userPermissions]);

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Insufficient permissions',
                code: 'PERMISSION_DENIED',
                message: "Permission 'READ_USERS' is required for this action"
            });
            expect(mockNext).not.toHaveBeenCalled();
        });




        it('should handle database connection errors', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';

            mockResponse.locals = { uuid: userUuid };
            mockPool.getConnection.mockRejectedValue(new Error('Connection failed'));

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Permission validation failed',
                code: 'PERMISSION_CHECK_ERROR',
                message: 'Unable to verify permissions'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });




        it('should handle database query errors', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockRejectedValue(new Error('Query failed'));

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Permission validation failed',
                code: 'PERMISSION_CHECK_ERROR',
                message: 'Unable to verify permissions'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });




        it('should handle database unreachable scenario', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';

            mockResponse.locals = { uuid: userUuid };
            // Simuler que la database n'est pas accessible
            mockPool.getConnection.mockRejectedValue(new Error('ECONNREFUSED'));

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Permission validation failed',
                code: 'PERMISSION_CHECK_ERROR',
                message: 'Unable to verify permissions'
            });
        });




        it('should release connection even when query fails', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockRejectedValue(new Error('Query failed'));

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockConnection.release).toHaveBeenCalled();
        });




        it('should store user permissions in res.locals on success', async () => {
            // Arrange
            const requiredPermission = 'READ_USERS';
            const userUuid = 'user-123';
            const userPermissions = [
                { code: 'READ_USERS' },
                { code: 'WRITE_POSTS' },
                { code: 'DELETE_COMMENTS' }
            ];

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockResolvedValue([userPermissions]);

            const checkMiddleware = middleware.check(requiredPermission);

            // Act
            await checkMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.locals.permissions).toEqual([
                'READ_USERS',
                'WRITE_POSTS',
                'DELETE_COMMENTS'
            ]);
        });



        
        it('should work with different permission requirements', async () => {
            // Arrange
            const userUuid = 'user-123';
            const userPermissions = [{ code: 'ADMIN_ACCESS' }, { code: 'USER_MANAGEMENT' }];

            mockResponse.locals = { uuid: userUuid };
            mockConnection.query.mockResolvedValue([userPermissions]);

            // Test pour ADMIN_ACCESS
            const adminCheckMiddleware = middleware.check('ADMIN_ACCESS');
            await adminCheckMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockNext).toHaveBeenCalled();

            // Reset des mocks
            jest.clearAllMocks();
            mockConnection.query.mockResolvedValue([userPermissions]);

            // Test pour une permission non possédée
            const restrictedCheckMiddleware = middleware.check('SUPER_ADMIN');
            await restrictedCheckMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
        });
    });
});