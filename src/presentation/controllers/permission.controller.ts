// Express importation
import { Request, Response } from "express";

// Service importation
import PermissionService from "../../data/services/permission.service";

import { isUUID } from 'validator';



class PermissionController {
    private permissionService: PermissionService;

    constructor(permissionService: PermissionService) {
        this.permissionService = permissionService;
    }

    /**
     * Get all permissions of a user by its uuid
     * @param req 
     * @param res 
     * @returns 
     */
    public async getPermissions(req: Request, res: Response): Promise<Response> {
        const option = req.query.option as string;
        console.log('Valeur que query.option : ', option)

        try {
            if (!option) return res.status(400).json({ message: `Paramètre '${option}' non reconnu` });

            if (isUUID(option)) {
                // Get and check its uuid from the query
                if (!isUUID(option)) return res.status(400).json({ message: "option invalide" });
                const response = await this.permissionService.getPermissionsByUserUuid(option);
                if (!response) return res.status(400).json({ message: "Aucune permission trouvée pour cet utilisateur." });
                return res.status(200).json(response);
            }

            if (option === 'role') {
                if (!option) return res.status(400).json({ message: "option invalide" });
                const response = await this.permissionService.getPermissionsByRole();
                if (!response) return res.status(400).json({ message: "Aucune permission trouvée pour ce role." });
                return res.status(200).json(response);
            }

            return res.status(400).json({ message: `Paramètre '${option}' non reconnu` })
        }
        catch (error) {
            console.error("Erreur dans PermissionController - getPermissionsByUserUuid :", error);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
    }



/**
 * Update Permissions
 * @param req 
 * @param res 
 */
  public async updatePermissionsByRole(req: Request, res: Response): Promise<Response> {
    try {
      const updates = req.body;
      if (!Array.isArray(updates))  return res.status(400).json({ message: `Le format des données est invalide. Un tableau est attendu.` });

      const response = await this.permissionService.updatePermissionsByRole(updates);
      if (!response) return res.status(400).json({ message: "Aucune permission trouvée pour cet utilisateur." });

      return res.status(200).json(response);
    }
    catch (error) {
      console.error("Erreur dans PermissionController - updatePermissionsByRole :", error);
      return res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }
}



export default PermissionController;