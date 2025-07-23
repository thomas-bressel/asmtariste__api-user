// Express importation
import express, {Request, Response} from "express";

// Layers importation
import RoleController  from '../controllers/role.controller'; 
import RoleService from '../../data/services/role.service';
import RoleRepository from "../../data/repositories/role.repository";

// Middlewares import
import BodyParserMiddleware from "../middlewares/body-parser.middleware";
import CsrfMiddleware from "../middlewares/csrf.middleware";
import PermissionMiddleware from "../middlewares/permission.middleware";

const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();
const permissionMiddleware = new PermissionMiddleware();

const roleRepository = new RoleRepository()
const roleService = new RoleService(roleRepository)
const roleController = new RoleController(roleService);

router.use(BodyParserMiddleware.urlEncodedParser);


// Routes that will implement csrf middleware and permission middleware
router.get("/user/v1/admin/roles", csrfMiddleware.authToken, permissionMiddleware.check("VIEW_ALL_ROLES"), async (req: Request, res: Response) => { 
    roleController.getAllRoles(req, res)
});


export default router;