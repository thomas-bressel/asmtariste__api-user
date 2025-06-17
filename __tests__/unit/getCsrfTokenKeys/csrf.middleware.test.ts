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