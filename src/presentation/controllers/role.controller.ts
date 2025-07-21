// Express importation
import { Request, Response } from "express";

// Service importation
import RoleService from "../../data/services/role.service";


class PermissionController {
    private roleService: RoleService;

    constructor(roleService: RoleService) {
        this.roleService = roleService;
    }

    
    /**
     * Get all roles
     * @param req 
     * @param res 
     * @returns 
     */
    public async getAllRoles(req: Request, res: Response): Promise<Response> {
        try {
            const response = await this.roleService.getAllRoles();
            if (!response) return res.status(400).json({ message: "Aucune Role trouvée pour cet utilisateur." });
            return res.status(200).json(response);
        }
        catch (error) {
            console.error("Erreur dans RoleController - getAllRoles :", error);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
    }
}



export default PermissionController;