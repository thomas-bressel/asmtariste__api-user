/**
 * Middleware for handling CSRF token validation and authentication.
 * 
 * @version 2.1.2
 * @author Thomas Bressel
 * @since 2025-06-09
 * 
 * @security This middleware provides methods to validate and verify JSON Web Tokens (JWT)
 * for CSRF protection. It also retrieves configuration keys such as secret keys
 * and token durations from environment variables.
 * 
 * @remarks
 * - Ensure that the required environment variables (`JWT_SECRET_KEY`, 
 *   `JWT_REFRESH_SECRET_KEY`, `JWT_DURATION`, `JWT_REFRESH_TOKEN_TIME`) are set.
 * - The middleware throws errors if any of the required keys are missing.
 */

// Express import
import { Request, Response, NextFunction } from "express";

// libraries import
import jwt from "jsonwebtoken";

// models import
import { CsrfTokenType } from "../models/csrf.model";

class CsrfMiddleware {


    constructor() {
        this.authToken = this.authToken.bind(this);
        this.authRefresh = this.authRefresh.bind(this);
    }


    /**
     * Get the CSRF token keys from environment variables.
     * @returns 
     */
    public static getCsrfTokenKeys(): CsrfTokenType {
        return {
            secretKey: this.secretKey,
            refreshKey: this.refreshKey,
            tokenTime: this.tokenTime,
            refreshTokenTime: this.refreshTokenTime
        };
    }

    /**
     * Main method to authenticate the token.
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public authToken(req: Request, res: Response, next: NextFunction): void {
        const token = this.extractToken(req);
        if (!this.isTokenValid(token)) {
            res.status(401).json({
                error: 'Token missing or invalid',
                code: 'TOKEN_MISSING',
                message: 'Authentication token is required'
            });
            return;
        }

        const secretKey = CsrfMiddleware.secretKey;
        if (!secretKey) {
            res.status(500).json({
                error: 'Secret key missing',
                code: 'SERVER_ERROR',
                message: 'Internal server error'
            });
            return;
        }

        this.verifyToken(token as string, secretKey, res, next);
    }

    /**
     * Method to authenticate the refresh token.
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public authRefresh(req: Request, res: Response, next: NextFunction): void {
        const refreshToken = this.extractToken(req);
        if(!refreshToken) return;

        if (!this.isTokenValid(refreshToken)) {
            res.status(401).json({
                error: 'Refresh token missing or invalid',
                code: 'REFRESH_TOKEN_MISSING',
                message: 'Please login again'
            });
            return;
        }

        const refreshKey = CsrfMiddleware.refreshKey;
        if (!refreshKey) {
            res.status(500).json({
                error: 'Refresh key missing',
                code: 'SERVER_ERROR'
            });
            return;
        }
        this.verifyRefresh(refreshToken, refreshKey, res, next);
    }


    /**
     * exctract the token from the request headers.
     * @param req 
     * @returns the token without the "Bearer" prefix
     */
    private extractToken(req: Request): string | undefined {
        const header: string | undefined = (req.headers as any)['authorization'];
        return header && header.split(' ')[1];
    }

    /**
     * Check if the token is valid.
     * @param token 
     * @returns 
     */
    private isTokenValid(token: string | undefined): boolean {
        return token !== undefined && token !== 'null' && token !== '';
    }

    /**
     * Verify the token using the secret key.
     * @param token 
     * @param secretKey 
     * @param req 
     * @param res 
     * @param next 
     */
    private verifyToken(token: string, secretKey: string, res: Response, next: NextFunction): void {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        error: 'Token expired',
                        code: 'TOKEN_EXPIRED',
                        message: 'Please use refresh token'
                    });
                } else {
                    return res.status(401).json({
                        error: 'Invalid token',
                        code: 'INVALID_TOKEN',
                        message: 'Please login again'
                    });
                }
            }
            Object.assign(res.locals, decoded);
            next();
        });
    }

    /**
     * Verify the refresh token using the refresh key.
     * @param token 
     * @param refreshKey 
     * @param res 
     * @param next 
     */
    private verifyRefresh(token: string, refreshKey: string, res: Response, next: NextFunction): void {
        jwt.verify(token, refreshKey, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        error: 'Refresh token expired',
                        code: 'REFRESH_TOKEN_EXPIRED',
                        message: 'Please login again'
                    });
                } else {
                    return res.status(401).json({
                        error: 'Invalid refresh token',
                        code: 'INVALID_REFRESH_TOKEN',
                        message: 'Please login again'
                    });
                }
            }

            Object.assign(res.locals, decoded);
            next();
        });
    }

    /**
     * Getter to get secretKey from the environnement variables
     */
    private static get secretKey(): string {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) throw new Error('Error: Missing secret key');
        return secretKey;
    }

    /**
     * Getter to get refreshKey from the environnement variables
     */
    private static get refreshKey(): string {
        const refreshKey = process.env.JWT_REFRESH_SECRET_KEY;
        if (!refreshKey) throw new Error('Error: Missing refresh key');
        return refreshKey;
    }

    /**
     * Getter to get token duration from the environnement variables
     */
    private static get tokenTime(): string {
        const tokenTime = process.env.JWT_DURATION;
        if (!tokenTime) throw new Error('Error: Missing token duration');
        return tokenTime;
    }

    /**
     * Getter to get refresh token time from the environnement variables
     */
    private static get refreshTokenTime(): string {
        const refreshTokenTime = process.env.JWT_REFRESH_TOKEN_TIME;
        if (!refreshTokenTime) throw new Error('Error: Missing refresh token duration');
        return refreshTokenTime;
    }
}

export default CsrfMiddleware;