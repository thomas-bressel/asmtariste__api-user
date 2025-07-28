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
import { ValidateUpdateUserDTO } from "../dtos/validate-update-user.dto";
import { UpdateUserDTO } from "../dtos/update-user.dto";


// Library imports
import bcrypt from 'bcryptjs';
import { randomBytes } from "crypto";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from "fs/promises";
import path from "path";

import { MailOptionsModel } from "../../presentation/models/mail.model";
import MailService from "../../data/services/mail.service";
import MultipartMiddleware from "../../presentation/middlewares/multipart.middleware";



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
   * Get user information by uuid
   * @param uuid 
   * @returns 
   */
  public async getUserByUuid(uuid: string): Promise<UserResponseDTO> {
    const user: User = await this.userRepository.getUserByUuid(uuid);
    return UserResponseDTO.fromEntity(user);
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
   * Get all users with their role and the status of their session
   * @returns 
   */
  public async getAllActiveUserUuid(): Promise<UserRoleResponseDTO[]> {
    try {
      const activeUsers = await this.userRepository.getAllActiveUserUuid();
      const rawUsersWithRole = await this.userRepository.getAllUsersWithRole();
  
      // Utiliser directement le DTO avec activeUsers
      return UserRoleResponseDTO.toUserWithRoleDTOs(rawUsersWithRole, activeUsers);
      
    } catch (error) {
      console.error("Error in UserService - getAllActiveUserUuid:", error);
      throw new Error("Impossible de récupérer les utilisateurs connectés");
    }
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
    console.log('PASSWORDD CREATED : ', password)

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




  /**
   * Ghost user to anonymize its personnal data while keeping public datas
   * @param uuid 
   * @returns 
   */
  public async ghostUser(uuid: string): Promise<boolean> {

    // On vérifie que l'utilisateur à ghoster existe et on recupère les données
    const userToGhost = await this.getUserByUuid(uuid);

    if (!userToGhost) throw new Error("Aucun utilisateur trouvé");
    if (userToGhost.nickname === "_ghost" || userToGhost.id_role === 666) throw new Error("Cet utilisateur est déjà mort !");
    if (userToGhost.is_activated === 1 ) throw new Error("Cet utilisateur ne peut pas être ghosté, il doit être innactif !");

    // Suppression du fichier avatar si présent
    if (userToGhost.avatar && userToGhost.avatar !== "default-avatar.webp") {
      const avatarPath = path.join(__dirname, "../../uploads/avatars", userToGhost.avatar);

      try {
        await fs.unlink(avatarPath);
        console.log("Avatar supprimé:", avatarPath);
      } catch (err: any) {
        // Si le fichier n'existe pas, on ne bloque pas la suppression de l'utilisateur
        if (err.code !== "ENOENT") {
          console.error("Erreur lors de la suppression de l'image:", err);
          throw new Error("Erreur lors de la suppression de l'image");
        }
      }
    }

    // On modifie l'utilisateur en base donnée
    const ghostedUser = await this.userRepository.ghostUser(uuid);
    if (!ghostedUser) throw new Error("Erreur lors de la suppression de l'utilisateur");
    return ghostedUser;
  }





  /**
   * Get the list of all users
   * @returns 
   */
  public async generateHashedPassword(pwd: string): Promise<string[]> {

    const hashedPassword = await bcrypt.hash(pwd, 10);
    return [hashedPassword, pwd];
  }





  /**
   * Delete a ghost user
   * @param uuid 
   */
  public async deleteUser(uuid: string): Promise<boolean> {

    // On vérifie que l'utilisateur à supprimer existe et on recupère les données
    const userToDelete = await this.getUserByUuid(uuid);
    if (!userToDelete) throw new Error("Aucun utilisateur trouvé");
    if (userToDelete.nickname !== "_ghost" || userToDelete.id_role !== 666) throw new Error("Vous ne pouvez pas supprimer cet utilisateur car il n'est pas anonymisé");

    // Suppression du fichier avatar si présent
    if (userToDelete.avatar && userToDelete.avatar !== "default-avatar.webp") {
      const avatarPath = path.join(__dirname, "../../uploads/avatars", userToDelete.avatar);

      try {
        await fs.unlink(avatarPath);
      } catch (err: any) {
        // Si le fichier n'existe pas, on ne bloque pas la suppression de l'utilisateur
        if (err.code !== "ENOENT") {
          console.error("Erreur lors de la suppression de l'image:", err);
          throw new Error("Erreur lors de la suppression de l'image");
        }
      }
    }

    // On modifie l'utilisateur en base donnée
    const deletedUser = await this.userRepository.deleteUser(uuid);
    if (!deletedUser) throw new Error("Erreur lors de la suppression de l'utilisateur");
    return deletedUser;
  }




/**
 * Update a user
 * @param validatedData - DTO déjà validé par le controller
 * @param userFile 
 * @returns 
 */
public async updateUser(validatedData: ValidateUpdateUserDTO, userFile?: Express.Multer.File): Promise<User> {

  // On vérifie que l'utilisateur à modifier existe et on recupère les données
  const userToUpdate = await this.getUserByUuid(validatedData.uuid);
  if (!userToUpdate) throw new Error("Aucun utilisateur trouvé");
  console.log('Utilisateur à mettre à jour : ', userToUpdate)
  
  // Check if nickname already exists in database excepted on its own (defined by unique uuid)
  const userResult = await this.userRepository.isNicknameExists(validatedData.nickname, validatedData.uuid);
  if (userResult) throw new Error("Le pseudo existe déjà");
  
  // Check if email already exists in database excepted on its own (defined by unique uuid)
  const emailResult = await this.userRepository.isEmailExists(validatedData.email, validatedData.uuid);
  if (emailResult) throw new Error("L'email existe déjà");
  
  // Conversion du DTO validé vers le DTO de transformation
  const updateUserDTO = UpdateUserDTO.fromValidatedData(validatedData);
  
  // Conversion vers l'entité User
  const userEntity = updateUserDTO.toEntity(userFile);

  console.log('Entité User créée : ', userEntity);

  // Sauvegarde du fichier mis en mémoire, sur le disque, si un fichier est présent
  if (userFile && userFile.buffer) {
    const avatarPath = MultipartMiddleware.saveFileFromMemory(userFile.buffer, userFile.originalname, '../uploads/avatars');
    userEntity.avatar = avatarPath;
  }

  // Update the user into database
  const updatedUser = await this.userRepository.updateUser(userEntity);
  if (!updatedUser) throw new Error("Erreur lors de la modification de l'utilisateur");

  console.log('Utilisateur mis à jour avec succès');
  return userEntity;
}


  // /**
  //  * Validate the user data when creating a new user
  //  * @param userData 
  //  * @param userFile 
  //  * @returns 
  //  */
  // private async validateNewUserData(userData: User, userFile?: Express.Multer.File): Promise<User | string> {
  //   const validatedDataUser: any = {};

  //   const nickname = userData.nickname;
  //   if (!validator.isLength(nickname, { min: 3, max: 25 })) return "Le pseudo doit contenir entre 3 et 25 caractères";

  //   const firstname = userData.firstname;
  //   if (firstname && !validator.isLength(firstname, { min: 0, max: 25 })) return "Le prénom doit contenir 50 caractères maximum";

  //   const lastname = userData.lastname;
  //   if (lastname && !validator.isLength(lastname, { min: 0, max: 50 })) return "Le nom doit contenir 50 caractères maximum";

  //   const email = userData.email;
  //   if (!validator.isEmail(email)) return "Invalid email";
  //   if (!validator.isLength(email, { min: 0, max: 50 })) return "L'email doit contenir 50 caractères maximum";

  //   const id_role = validator.toInt(userData.id_role.toString());
  //   let avatar!: string;

  //   console.log('Field Name : ', userFile?.fieldname)
  //   console.log('OriginalName : ', userFile?.originalname)

  //  // If there is no file sent from the form, then avatar = avatar
  //  if (!userFile?.fieldname) {
  //   console.log('Il n\'y a aucun fichier, avatar = avatar',userData.avatar)
  //   avatar = userData.avatar;
  // }
  
  // // If a file is sent from the form, the avatar = filename 
  // if (userFile?.originalname) {
  //   console.log('Il a un fichier, avatar = originalname',userFile?.originalname)
  //   avatar = userFile?.originalname;
  // }


  //   validatedDataUser.uuid = userData.uuid;
  //   validatedDataUser.nickname = nickname;
  //   validatedDataUser.firstname = firstname;
  //   validatedDataUser.lastname = lastname;
  //   validatedDataUser.email = email;
  //   validatedDataUser.avatar = avatar;
  //   validatedDataUser.id_role = id_role;

  //   return validatedDataUser;
  // }





}

export default UserService;
