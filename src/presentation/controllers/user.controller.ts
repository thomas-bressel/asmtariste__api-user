// Express importation
import { Request, Response } from "express";

// Service importation
import UserService from "../../data/services/user.service";

// Libraries importation
import { validate } from 'class-validator';

// DTO importations
import { CreateSessionDTO } from "../../data/dtos/create-session.dto";


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

    try {
      if (!option) return res.status(400).json({ message: `Paramètre '${option}' non reconnu` });

      if (option === 'all') {
        const response = await this.userService.getAllUsers();
        if (!response) throw new Error("Résultat vide dans users");
        return res.status(200).json(response);
      }

      if (option === 'role') {
        const response = await this.userService.getAllUsersWithRole();
        if (!response) throw new Error("Résultat vide dans users");
        return res.status(200).json(response);
      }
      return res.status(400).json({ message: `Paramètre '${option}' non reconnu` })

    }
    catch (error) {
      console.error("Erreur dans UserController - users :", error);
      return res.status(500).json({ message: (error instanceof Error ? error.message : "Erreur interne du serveur") });
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
      if (errors.length > 0) throw new Error("Données invalides.");

      // create a new session
      const authSession = await this.userService.createSession(createSessionDTO.nickname, createSessionDTO.password);
      if (!authSession) throw new Error("Aucune informations trouvée pour cet utilisateur.");

      return res.status(200).json(authSession);

    }
    catch (error) {
      console.error("Erreur dans UserController - createSession :", error);
      return res.status(500).json({ message: (error instanceof Error ? error.message : "Erreur interne du serveur") });
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
      console.error("Erreur dans UserController - refreshToken :", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Erreur interne du serveur"
      });
    }
  }
}

export default UserController;