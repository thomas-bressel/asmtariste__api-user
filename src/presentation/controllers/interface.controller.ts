// Express importation
import { Request, Response } from "express";

// Service importation
import InterfaceService from "../../data/services/interface.service";

class InterfaceController {
    private interfaceService: InterfaceService;


    constructor(interfaceService: InterfaceService) {
        this.interfaceService = interfaceService;
    }


    public async getDefaultInterfaceByType(req: Request, res: Response): Promise<Response> {
        try {

            let type: string;
            if (req.query && req.query.type) {
                type = req.query.type as string
            } else {
                return res.status(404).json({ message: "Données manquantes" });
            }

            const defaultInterface = await this.interfaceService.getDefaultInterfaceByType('private', type);
            if (!defaultInterface) {
                return res.status(404).json({ message: "Interface non trouvée" });
            }

            return res.status(200).json(defaultInterface);

        } catch (error) {
            console.error("Erreur dans InterfaceController - interface :", error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Erreur interne du serveur"
            });
        }
    }




}


export default InterfaceController;