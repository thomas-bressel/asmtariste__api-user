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
    public async getPermissionsByUserUuid(req: Request, res: Response): Promise<Response> {
        try {

            // Get and check its uuid from the query
            const uuid = req.query.uuid as string;
            if (!isUUID(uuid)) return res.status(400).json({ message: "ID de permission invalide" });

            const response = await this.permissionService.getPermissionsByUserUuid(uuid);
            if (!response) return res.status(400).json({ message: "Aucune permission trouvée pour cet utilisateur." });

            return res.status(200).json(response);
        }
        catch (error) {
            console.error("Erreur dans PermissionController - getPermissionsByUserUuid :", error);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
    }



}



export default PermissionController;