// Express importation
import express, {Request, Response} from "express";

// Layers importation
import InterfaceController  from '../controllers/interface.controller'; 
import InterfaceService from '../../data/services/interface.service';
import InterfaceRepository from "../../data/repositories/interface.repository";

import PermissionService from "../../data/services/permission.service";
import PermissionRepository from "../../data/repositories/permission.repository";

// Middlewares import
import BodyParserMiddleware from "../middlewares/body-parser.middleware";
import CsrfMiddleware from "../middlewares/csrf.middleware";
import PermissionMiddleware from "../middlewares/permission.middleware";

const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();
const permissionMiddleware = new PermissionMiddleware();

const interfaceRepository = new InterfaceRepository()
const interfaceService = new InterfaceService(interfaceRepository)
const permissionRepository = new PermissionRepository();
const permissionService = new PermissionService(permissionRepository);
const interfaceController = new InterfaceController(interfaceService, permissionService);

router.use(BodyParserMiddleware.urlEncodedParser);


// Routes that will implement csrf middleware
router.get("/user/v1/admin/interface", csrfMiddleware.authToken, async (req: Request, res: Response) => {
    interfaceController.getDefaultInterfaceByType(req, res)
});




export default router;