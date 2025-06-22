// Express importation
import { Request, Response } from "express";


import { isUUID } from 'validator';


// Service importation
import InterfaceService from "../../data/services/interface.service";
import PermissionService from "../../data/services/permission.service";

class InterfaceController {
    private interfaceService: InterfaceService;
    private permissionService: PermissionService;



    constructor(interfaceService: InterfaceService, permissionService: PermissionService) {
        this.interfaceService = interfaceService;
        this.permissionService = permissionService;
    }


    public async getDefaultInterfaceByType(req: Request, res: Response): Promise<Response> {
        try {

            // Get datas from request and response
            const { type } = req.query;
            const uuid: string = res.locals.uuid;

            console.log('type: ',type)
            console.log('uuid: ',uuid)

            // request query data validation
            if (!type || typeof type !== 'string') return res.status(400).json({ message: "Paramètre 'type' manquant ou invalide" });

            const allowedTypes = ['navigation', 'survey', 'article', 'user', 'tag', 'menu', 'survey-create-form', 'article-create-form'];
            if (!allowedTypes.includes(type)) return res.status(400).json({ message: `Type '${type}' non autorisé.` });

            // reponse locals data validation
            if (!isUUID(uuid)) return res.status(400).json({ message: "ID de permission invalide" });

            // Get permissions list from this user
            const userPermissions = await this.permissionService.getPermissionsByUserUuid(uuid);
            if (!userPermissions) return res.status(400).json({ message: "Résultat vide dans getPermissionsByUserUuid" });
            // console.log('Permission de l\'utilisateur', userPermissions)

            // Get default interface from database
            const defaultInterface = await this.interfaceService.getDefaultInterfaceByType('private', type);
            if (!defaultInterface) return res.status(404).json({ message: "Interface non trouvée" });
            console.log('Interface par defaut : ',defaultInterface)

            // Filter interface depending on the role and permissions
            const filteredInterface = this.interfaceService.filterInterfaceByPermissions(userPermissions, defaultInterface);
            return res.status(200).json(filteredInterface);

        } catch (error) {
            console.error("Erreur dans InterfaceController - interface :", error);
            return res.status(500).json({ message: error instanceof Error ? error.message : "Erreur interne du serveur" });
        }
    }




}


export default InterfaceController;