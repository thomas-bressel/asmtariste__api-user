/**
 * Cors Middleware - Cors configuration management
 * @version 1.2.0
 * @author Thomas Bressel
 * @since 2024-05-15
 */


import { CorsList } from "../models/cors.model";

class CorsMiddleware {
  
  private static readonly ERROR_NO_ORIGINS = "No allowed origins set for the CORS";
  private static readonly ERROR_NO_CREDENTIALS = "No credentials set for the CORS";
  private static readonly ERROR_INVALID_CORS_CONFIG = "La configuration CORS est invalide : Aucune origine autorisée définie.";


  
  /**
   * Retrieves the CORS configuration.
   * 
   * @returns An object containing the CORS configuration.
   * @throws Will throw an error if the CORS configuration is invalid.
   */
  public static getCorsConfig(): CorsList {
    const origins = this.origins;
    const credentials = this.credentials;

    if (origins.length === 0) {
      throw new Error(this.ERROR_INVALID_CORS_CONFIG);
    }

    return {
      origin: origins,
      credentials: credentials,
      optionsSuccessStatus: 200,
    };
  }

  

  /**
   * Retrieves the allowed origins for CORS from environment variables.
   * 
   * @returns An array of allowed origins.
   * @throws Will throw an error if no allowed origins are set.
   */
  private static get origins(): string[] {
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
    return allowedOrigins ? allowedOrigins.split(",") : (() => { throw new Error(this.ERROR_NO_ORIGINS); })();
  }



  /**
   * Retrieves the credentials setting for CORS from environment variables.
   * 
   * @returns A boolean indicating whether credentials are allowed.
   * @throws Will throw an error if no credentials setting is set.
   */
  private static get credentials(): boolean {
    const credentialsString = process.env.CORS_CREDENTIALS;
    return credentialsString !== undefined ? credentialsString === "true" : (() => { throw new Error(this.ERROR_NO_CREDENTIALS); })();
  }
}
export default CorsMiddleware;