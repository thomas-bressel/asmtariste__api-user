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
import { CsrfTokenType, DecodedToken } from "../../presentation/models/csrf.model";

//DTO import
import { ValidateCreateUserDTO } from "../dtos/validate-create-user.dtos";

// Library imports
import bcrypt from 'bcryptjs';
import { randomBytes } from "crypto";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { MailOptionsModel } from "../../presentation/models/mail.model";
import MailService from "../../data/services/mail.service";



class UserService {
  private userRepository: UserRepository;
  private mailService: MailService;

  constructor(userRepository: UserRepository, mailService: MailService) {
    this.userRepository = userRepository;
    this.mailService = mailService;
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


  /**
   * Get uuid from cache to know if the user is connected 
   * @param decoded 
   * @returns 
   */
  public async verifySession(decoded: DecodedToken): Promise<boolean> {
    return await this.userRepository.isUserConnected(decoded.uuid);
  }



  /**
   * Delete uuid from cache to know if the user is connected 
   * @param decoded 
   * @returns 
   */
  public async deleteSession(decoded: DecodedToken): Promise<boolean> {

    try {
      const isConnected = await this.userRepository.isUserConnected(decoded.uuid);
      if (!isConnected) return false;

      const isDeleted = await this.userRepository.deleteSession(decoded.uuid);
      if (!isDeleted) return false;


      return true;
    } catch (error) {
      console.error("Error in UserService - storeSession :", error);
      throw new Error("Impossible to stock the session");
    }

  }





  /**
   * Create a new user
   * @param validatedData 
   * @returns 
   */
  public async createUser(validatedData: ValidateCreateUserDTO): Promise<UserResponseDTO> {

    // Check if the nickname already exists in database
    const userResult = await this.userRepository.isNicknameExists(validatedData.nickname);
    if (userResult) throw new Error("Le pseudo existe déjà");

    // Check if the email already exists in database
    const emailResult = await this.userRepository.isEmailExists(validatedData.email);
    if (emailResult) throw new Error("L'email existe déjà");

    // Generate a unique uuid
    const uuid: string = uuidv4();

    // generate a random password then hash
    const password = this.generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build a new user
    const createNewUser: User = new User(
      null,
      uuid,
      validatedData.nickname,
      validatedData.email,
      hashedPassword,
      "",
      "",
      new Date(),
      new Date(),
      false,
      validatedData.id_role,
      'default-avatar.webp'
    )

    // Create new user into database
    const newUser = await this.userRepository.createUser(createNewUser);
    if (!newUser) throw new Error("Erreur lors de la création de l'utilisateur");

    // Send welcome email
    // const isMailsent = await this.sendWelcomeEmail(createNewUser, password);
    // if(!isMailsent) throw new Error("Erreur lors de l'envoie du mail de bienvenue'");

    const userCreated = UserResponseDTO.fromEntity(createNewUser);

    return userCreated;
  }



  

  /**
   * Send welcome email to newly created user
   * @param user - The created user
   * @param password - The generated password
   * @private
   */
  private async sendWelcomeEmail(user: User, password: string): Promise<boolean> {
    try {
      // Test SMTP connection first
      const isConnected = await this.mailService.testConnection();
      if (!isConnected) {
        console.warn('⚠️ SMTP connection failed, but user created successfully');
        return false;
      }

      // Create and send email
      const emailOptions: MailOptionsModel = this.mailService.createEmailOptions(
        user.email,
        user.nickname,
        password
      );

      const emailResponse = await this.mailService.sendMail(emailOptions);
      this.mailService.stat(emailResponse);
      return true;

    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      return false
    }
  }




  /**
   * Generate a random password secure and complex
   * @param segments 
   * @param segmentLength 
   * @returns 
   */
  private generatePassword(segments = 4, segmentLength = 6): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

    const getRandomSegment = () =>
      Array.from({ length: segmentLength })
        .map(() => chars[randomBytes(1)[0] % chars.length])
        .join("");

    return Array.from({ length: segments })
      .map(getRandomSegment)
      .join("-");
  };




  /**
   * Toggle the activation of the user account
   * @param uuid 
   * @returns 
   */
  public async toggleActivate(uuid: string): Promise<any> {
    try {
      const response = await this.userRepository.toggleActivate(uuid);
      return response;
    } catch (error) {
      console.error("Erreur dans UserService - toggleActivate :", error);
      throw new Error("Impossible de supprimer l'utilisateur");
    }
  }


}

export default UserService;
