// Express importation
import { Request, Response } from "express";

// Service importation
import UserService from "../../data/services/user.service";

// Libraries importation
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// DTO importations
import { CreateSessionDTO } from "../../data/dtos/create-session.dto";
import { ValidateCreateUserDTO } from "../../data/dtos/validations/validate-create-user.dtos";
import { ValidateUpdateUserDTO } from "../../data/dtos/validations/validate-update-user.dto";

import { DecodedToken } from "../models/csrf.model";
import { isUUID } from 'validator';



class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;

  }



  /**
   * Get the list of all users
   * @param req 
   * @param res 
   * 
   * @returns Promise<Response> - Express response object with appropriate status code and data
   * 
   * @throws {400} When the 'option' parameter is missing or contains an unrecognized value
   * @throws {500} When an internal server error occurs during user retrieval
   */
  public async getAllUsers(req: Request, res: Response): Promise<Response> {
    const option = req.query.option as string;
    let session = (req.query.session as string === 'true') ? true : false; 


    try {
      if (!option) return res.status(400).json({ message: `Paramètre '${option}' non reconnu` });

      if (option === 'role' && session) {
        const response = await this.userService.getAllActiveUserUuid();
        if (!response) throw new Error("Résultat vide dans users");
        return res.status(200).json(response);
      }

      if (option === 'all' && !session) {
        const response = await this.userService.getAllUsers();
        if (!response) throw new Error("Résultat vide dans users");
        return res.status(200).json(response);
      }

      if (option === 'role' && !session) {
        const response = await this.userService.getAllUsersWithRole();
        if (!response) throw new Error("Résultat vide dans users");
        return res.status(200).json(response);
      }

  

      return res.status(400).json({ message: `Paramètre '${option}' non reconnu` })

    }
    catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }



  /**
   * Send username and password to get a session token
   * @param req 
   * @param res 
   * @returns 
   */
  public async createSession(req: Request, res: Response): Promise<Response> {
    try {

      const createSessionDTO = new CreateSessionDTO();
      createSessionDTO.nickname = req.body.nickname;
      createSessionDTO.password = req.body.password;

      // check input DTO with class validator 
      const errors = await validate(createSessionDTO);
      if (errors.length > 0) {
        return res.status(400).json({
          error: "Données invalides",
          code: "VALIDATION_ERROR",
          details: errors
        });
      }

      // create a new session
      const authSession = await this.userService.createSession(createSessionDTO.nickname, createSessionDTO.password);
      if (!authSession) throw new Error("Controller: Aucune informations trouvée pour cet utilisateur.");

      // Store the session into redis
      const storeSession = await this.userService.storeSession(authSession);
      if (storeSession !== "OK") throw new Error("Résultat vide");

      return res.status(200).json(authSession);

    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur interne";

      if (errorMessage.includes("Aucun utilisateur trouvé")
        || errorMessage.includes("Mot de passe incorrect")) {
        return res.status(401).json({
          message: "Identifiants incorrects",
          code: "INVALID_CREDENTIALS"
        });
      }

      return res.status(500).json({
        message: errorMessage,
        code: "INTERNAL_ERROR"
      });
    }
  }


  /**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
  public async refreshSession(req: Request, res: Response): Promise<Response> {
    try {
      const decoded = res.locals;

      const newTokens = await this.userService.refreshSession(decoded);
      return res.status(200).json(newTokens);

    } catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }



  /**
   * Verify if the user has an active session
   * @param req 
   * @param res 
   * @returns 
   */
  public async verifySession(req: Request, res: Response): Promise<Response> {
    try {
      const decoded = res.locals as DecodedToken;

      // Check if the user has an active session
      const isValid = await this.userService.verifySession(decoded);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          code: 'SESSION_EXPIRED',
          message: "Session expired or invalid"
        });
      }

      return res.status(200).json({
        success: true,
      });

    } catch (error) {
      console.error('Error verifying session:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }



  /**
   * Delete a session
   * @param req 
   * @param res 
   * @returns 
   */
  public async deleteSession(req: Request, res: Response): Promise<Response> {

    try {
      const decoded = res.locals as DecodedToken;
      const isDeleted = await this.userService.deleteSession(decoded);

      if (isDeleted) {
        return res.status(200).json({
          success: true,
          code: 'SESSION_DELETED',
          message: "La session a été supprimé"
        })
      }

      return res.status(200).json({
        success: false,
        code: 'SESSION_DELETED',
        message: "La session n'a pas pu être supprimer"
      })


    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }





  }




  /**
   * Create a new User
   * @param req 
   * @param res 
   * @returns 
   */
  public async createUser(req: Request, res: Response): Promise<Response> {

    const user = req.body;
    if (!user) throw new Error("Aucune informations trouvée pour cet utilisateur.");

    // Validate input data from req.body
    const dto = plainToInstance(ValidateCreateUserDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) return res.status(400).json({ errors });

    try {

      const response = await this.userService.createUser(dto);
      if (!response) throw new Error("Erreur lors de la création de l'utilisateur");

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }

  }




  /**
   * Toggle the activation of the user account
   * @param req 
   * @param res 
   * @returns 
   */
  public async toggleActivate(req: Request, res: Response): Promise<Response> {
    try {
      const uuid = req.params.uuid as string;
      if (!isUUID(uuid)) throw new Error("ID de permission invalide");

      const response = await this.userService.toggleActivate(uuid);
      if (!response) throw new Error("Résultat vide dans toggleActivate");

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }





  /**
   * Anonymize a user 
   * @param req 
   * @param res 
   * @returns 
   */
  public async ghostUser(req: Request, res: Response): Promise<Response> {
    try {
      const uuid = req.params.uuid as string;
      if (!isUUID(uuid)) throw new Error("ID de permission invalide");


      const response = await this.userService.ghostUser(uuid);
      if (!response) throw new Error("Erreur lors de l'anonymisation de l'utilisateur");

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }






  /**
   * Delete a ghost user
   * @param req 
   * @param res 
   * @returns 
   */
  public async deleteUser(req: Request, res: Response): Promise<any> {
    try {
      const uuid = req.params.uuid as string;
      if (!isUUID(uuid)) throw new Error("ID de permission invalide");


      const response = await this.userService.deleteUser(uuid);
      if (!response) throw new Error("Erreur lors de la suppression de l'utilisateur");

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }






  /**
   * Get the list of all users
   * @param req 
   * @param res 
   * 
   * @returns Promise<Response> - Express response object with appropriate status code and data
   */
  public async generateHashedPassword(req: Request, res: Response): Promise<Response> {
    const pwd = req.query.pwd as string;
    console.log('Valeur que query.pwd : ', pwd)
    try {

      const response = await this.userService.generateHashedPassword(pwd);
      if (!response) throw new Error("Résultat vide dans users");
      return res.status(200).json(response);

    }
    catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }



/**
 * Update a user
 * @param req 
 * @param res 
 * @returns 
 */
public async updateUser(req: Request, res: Response): Promise<Response> {
  try {
    const user = req.body;
    if (!user) throw new Error("Aucune informations trouvée pour cet utilisateur.");

    // Validate input data from req.body
    const dto = plainToInstance(ValidateUpdateUserDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: errors
      });
    }

    const file = req.file;

    console.log('DONNEES UTILISATEUR ENTRANTES : ', user)
    console.log('DONNÉES FICHIER ENTRENTES : ', file)

    const response = await this.userService.updateUser(dto, file);
    console.log("RESPONSE  DE LA REQUETE : ", response);
    if (!response) throw new Error("Erreur lors de la modification de l'utilisateur");

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erreur dans UserController - updateUser :", error);
    return res.status(500).json({ message: (error instanceof Error ? error.message : "Erreur interne du serveur") });
  }
}





   /**
   * Get the information of one user
   * @param req 
   * @param res 
   * 
   * @returns Promise<Response> - Express response object with appropriate status code and data
   * 
   */
   public async getUserByUuid(req: Request, res: Response): Promise<Response> {
    const uuid = req.query.uuid as string;
    if (!isUUID(uuid)) throw new Error("ID de permission invalide");

    try {
     
        const response = await this.userService.getUserByUuid(uuid);
        if (!response) throw new Error("Résultat vide dans users");
        return res.status(200).json(response);

    }
    catch (error) {
      return res.status(500).json(error instanceof Error ? error.message : "Erreur interne du serveur");
    }
  }

}

export default UserController;