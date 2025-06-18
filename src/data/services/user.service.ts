// Layer imports
import UserRepository from "../repositories/user.repository";
import CsrfMiddleware from "../../presentation/middlewares/csrf.middleware";

// Entity imports
import User from "../../domain/entities/user.entity";
import UserRole from "../../domain/interfaces/user-role-aggregate.interface";
import { UserResponseDTO } from "../dtos/user-response.dto";
import { UserRoleResponseDTO } from "../dtos/user-role-response.dto";

// Models imports
import { Payload } from "../models/payload.model";
import { CsrfTokenType } from "../../presentation/models/csrf.model";


// Library imports
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';


class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }


  /**
   * Get the list of all users
   * @returns 
   */
  public async getAllUsers(): Promise<UserResponseDTO[]> {
    const users: User[] = await this.userRepository.getAllUsers();
    return UserResponseDTO.fromEntities(users);
  }



  /**
 * Get the list of all users with their role details
 * @returns 
 */
  public async getAllUsersWithRole(): Promise<UserRoleResponseDTO[]> {
    const rawData = await this.userRepository.getAllUsersWithRole();
    return UserRoleResponseDTO.toUserWithRoleDTOs(rawData);
  }



  /**
   * Get the session token for the user
   * @param nickname 
   * @param password 
   * @returns 
   */
  public async createSession(nickname: string, password: string): Promise<Payload> {

    // Cheking if this nickname exists, then return user's informations
    const user = await this.userRepository.getUserByNickname(nickname);

    // Créate a Flated data Object
    let newUserSession = UserRole.userRoleToDTO(user).toFlatObject()

    // Check if the entered password is correct with the user's one
    const isPasswordValid = await bcrypt.compare(password, newUserSession.hash_password);
    if (!isPasswordValid) throw new Error("Mot de passe incorrect");

    // Check if the user's role can access to the application
    if (!newUserSession.canAccess) throw new Error("Vous n'avez pas les droits d'accès");

    // Check if the user acount is activated
    if (!newUserSession.is_activated) throw new Error("Utilisateur inactif");

    const csrfTokenKeys: CsrfTokenType = CsrfMiddleware.getCsrfTokenKeys();
    if (!csrfTokenKeys.secretKey || !csrfTokenKeys.refreshKey) throw new Error("Secret key not found");

    // create a new session id 
    const sessionId = uuidv4();

    const payload: Payload = {
      id_session: sessionId,
      uuid: newUserSession.uuid,
      firstname: newUserSession.firstname,
      lastname: newUserSession.lastname,
      avatar: newUserSession.avatar,
      email: newUserSession.email,
      role: newUserSession.role_name,
      sessionToken: '',
      refreshToken: ''
    };

    payload.sessionToken = jwt.sign(payload, csrfTokenKeys.secretKey, { expiresIn: csrfTokenKeys.tokenTime as any });
    payload.refreshToken = jwt.sign(payload, csrfTokenKeys.refreshKey, { expiresIn: csrfTokenKeys.refreshTokenTime as any });

    return payload;
  }



  /**
   * Refresh the access token using the decoded refresh token data
   * @param decoded - Decoded refresh token payload from middleware
   * @returns New tokens
   */
  public async refreshSession(decoded: any): Promise<Payload> {
    try {
      // Check if the session exists in Redis 
      const sessionExists = await this.userRepository.isUserConnected(decoded.uuid);
      if (!sessionExists) {
        throw new Error("Session expired in cache");
      }

      const csrfTokenKeys: CsrfTokenType = CsrfMiddleware.getCsrfTokenKeys();
      if (!csrfTokenKeys.secretKey || !csrfTokenKeys.refreshKey) {
        throw new Error("Secret keys not found");
      }

      // Create new payload for new tokens
      const payload: Payload = {
        id_session: decoded.id_session,
        uuid: decoded.uuid,
        firstname: decoded.firstname,
        lastname: decoded.lastname,
        avatar: decoded.avatar,
        email: decoded.email,
        role: decoded.role,
        sessionToken: '',
        refreshToken: ''
      };

      payload.sessionToken = jwt.sign(payload, csrfTokenKeys.secretKey, { expiresIn: csrfTokenKeys.tokenTime as any });
      payload.refreshToken = jwt.sign(payload, csrfTokenKeys.refreshKey, { expiresIn: csrfTokenKeys.refreshTokenTime as any });

      return payload;

    } catch (error) {
      console.error("Erreur dans UserService - refreshToken :", error);
      throw new Error("Unable to refresh token");
    }
  }


    /**
     * 
     * @param authSession 
     * @returns 
     */
    public async storeSession(authSession: Payload): Promise<string | null> {
      try {
        if (authSession.uuid) {
          const response = await this.userRepository.storeSession(authSession.id_session, authSession.uuid);
          return response;
        }
        throw new Error("User is unknown");
      } catch (error) {
        console.error("Error in UserService - storeSession :", error);
        throw new Error("Impossible to stock the session");
      }
    }
  
}

export default UserService;
