import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CsrfMiddleware from '../../../src/presentation/middlewares/csrf.middleware';

// Mock JWT
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;



describe('CsrfMiddleware', () => {
    let middleware: CsrfMiddleware;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    const originalEnv = process.env;

    beforeEach(() => {

        // Mock RAZ
        jest.clearAllMocks();

        // Setting some environment variables for tests
        process.env = {
            ...originalEnv,
            JWT_SECRET_KEY: 'test-secret-key',
            JWT_REFRESH_SECRET_KEY: 'test-refresh-secret',
            JWT_DURATION: '15m',
            JWT_REFRESH_TOKEN_TIME: '7d'
        };

        middleware = new CsrfMiddleware();

        // Mock response with locals and methods
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            locals: {}
        };

        mockNext = jest.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    

    describe('authRefresh', () => {
        beforeEach(() => {
            mockRequest = {
                body: {}
            };
        });



        it('should authenticate successfully with valid refresh token', () => {
            // Arrange
            const validRefreshToken = 'valid.refresh.token';
            const decodedPayload = { userId: 123, role: 'user' };

            mockRequest.body = { refreshToken: validRefreshToken };
            mockJwt.verify.mockImplementation((token, secret, callback) => {
                (callback as any)(null, decodedPayload);
            });

            // Act
            middleware.authRefresh(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockJwt.verify).toHaveBeenCalledWith(validRefreshToken, 'test-refresh-secret', expect.any(Function));
            expect(mockResponse.locals).toEqual(decodedPayload);
            expect(mockNext).toHaveBeenCalledWith();
        });




        it('should reject when refresh token is missing', () => {
            // Arrange
            mockRequest.body = {}; // Pas de refreshToken

            // Act
            middleware.authRefresh(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Refresh token missing or invalid',
                code: 'REFRESH_TOKEN_MISSING',
                message: 'Please login again'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });




        it('should handle expired refresh token', () => {
            // Arrange
            const expiredRefreshToken = 'expired.refresh.token';
            mockRequest.body = { refreshToken: expiredRefreshToken };

            const tokenExpiredError = { name: 'TokenExpiredError', message: 'jwt expired' };
            mockJwt.verify.mockImplementation((token, secret, callback) => {
                (callback as any)(tokenExpiredError, null);
            });

            // Act
            middleware.authRefresh(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Refresh token expired',
                code: 'REFRESH_TOKEN_EXPIRED',
                message: 'Please login again'
            });
        });




        it('should handle invalid refresh token', () => {
            // Arrange
            const invalidRefreshToken = 'invalid.refresh.token';
            mockRequest.body = { refreshToken: invalidRefreshToken };

            const invalidTokenError = { name: 'JsonWebTokenError', message: 'invalid token' };
            mockJwt.verify.mockImplementation((token, secret, callback) => {
                (callback as any)(invalidTokenError, null);
            });

            // Act
            middleware.authRefresh(mockRequest as Request, mockResponse as Response, mockNext);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Invalid refresh token',
                code: 'INVALID_REFRESH_TOKEN',
                message: 'Please login again'
            });
        });



        
        it('should return server error when JWT_REFRESH_SECRET_KEY is missing', () => {
            // Arrange
            delete process.env.JWT_REFRESH_SECRET_KEY;
            mockRequest.body = { refreshToken: 'some.token' };

            // Act & Assert
            expect(() => {
                middleware.authRefresh(mockRequest as Request, mockResponse as Response, mockNext);
            }).toThrow('Error: Missing refresh key');

            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('getCsrfTokenKeys', () => {
        it('should return all required token configuration', () => {
            // Act
            const result = CsrfMiddleware.getCsrfTokenKeys();

            // Assert
            expect(result).toEqual({
                secretKey: 'test-secret-key',
                refreshKey: 'test-refresh-secret',
                tokenTime: '15m',
                refreshTokenTime: '7d'
            });
        });

        it('should throw error when JWT_SECRET_KEY is missing', () => {
            // Arrange
            delete process.env.JWT_SECRET_KEY;

            // Act & Assert
            expect(() => CsrfMiddleware.getCsrfTokenKeys()).toThrow('Error: Missing secret key');
        });

        it('should throw error when JWT_REFRESH_SECRET_KEY is missing', () => {
            // Arrange
            delete process.env.JWT_REFRESH_SECRET_KEY;

            // Act & Assert
            expect(() => CsrfMiddleware.getCsrfTokenKeys()).toThrow('Error: Missing refresh key');
        });

        it('should throw error when JWT_DURATION is missing', () => {
            // Arrange
            delete process.env.JWT_DURATION;

            // Act & Assert
            expect(() => CsrfMiddleware.getCsrfTokenKeys()).toThrow('Error: Missing token duration');
        });

        it('should throw error when JWT_REFRESH_TOKEN_TIME is missing', () => {
            // Arrange
            delete process.env.JWT_REFRESH_TOKEN_TIME;

            // Act & Assert
            expect(() => CsrfMiddleware.getCsrfTokenKeys()).toThrow('Error: Missing refresh token duration');
        });
    });
});