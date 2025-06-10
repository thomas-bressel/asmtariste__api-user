export interface CsrfTokenType {
    secretKey: string;
    refreshKey: string;
    tokenTime: string;
    refreshTokenTime: string;
}