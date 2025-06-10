// Express importation
import { Request, Response } from "express";

// Service importation
import UserService from "../../data/services/user.service";



class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }



/**
 * Get the list of all users
 * @param req 
 * @param res 
 * @returns 
 */
public async getAllUsers(req: Request, res: Response): Promise<Response> {
  const option = req.query.option as string;

  try {
    if (!option) return res.status(400).json({ message: `Paramètre '${option}' non reconnu`});

    if (option === 'all') {
      const response = await this.userService.getAllUsers();
      if (!response) throw new Error("Résultat vide dans users");
      return res.status(200).json(response);
    } else {
      return res.status(400).json({ message: `Paramètre '${option}' non reconnu`})
    }
   
  }
  catch (error) {
    console.error("Erreur dans UserController - users :", error);
    return res.status(500).json({ message: (error instanceof Error ? error.message : "Erreur interne du serveur") });
  }
}




}

export default UserController;