export interface CsrfTokenType {
    secretKey: string;
    refreshKey: string;
    tokenTime: string;
    refreshTokenTime: string;
}

export interface DecodedToken {
    id_session: string;
    uuid: string;
    firstname: string;
    lastname: string;
    avatar: string;
    email: string;
    role: string;
    sessionToken: string;
    refreshToken: string;
    iat: number;
    exp: number;
}