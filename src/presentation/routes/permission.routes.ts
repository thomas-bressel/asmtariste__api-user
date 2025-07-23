// Express importation
import express, {Request, Response, NextFunction, RequestHandler} from "express";

// Controllers importation
import PermissionController from "../controllers/permission.controller";
import PermissionRepository from "../../data/repositories/permission.repository";
import PermissionService from "../../data/services/permission.service";
import RoleService from "../../data/services/role.service";
import RoleRepository from "../../data/repositories/role.repository";

// Middlewares import
import BodyParserMiddleware from "../middlewares/body-parser.middleware";
import CsrfMiddleware from "../middlewares/csrf.middleware";
import PermissionMiddleware from "../middlewares/permission.middleware";


const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();
const permissionsMiddleware = new PermissionMiddleware();
const permissionRepository = new PermissionRepository();
const roleRepository = new RoleRepository();
const roleService = new RoleService(roleRepository);
const permissionService = new PermissionService(permissionRepository, roleService);
const permissionController = new PermissionController(permissionService);


router.use(BodyParserMiddleware.urlEncodedParser);
router.use(BodyParserMiddleware.jsonParser);


router.get("/user/v1/admin/permissions", csrfMiddleware.authToken, permissionsMiddleware.check("VIEW_ALL_PERMISSIONS"), async (req: Request, res: Response) => { 
    permissionController.getPermissions(req, res)
});

router.put("/user/v1/admin/permissions/update", csrfMiddleware.authToken, 
    permissionsMiddleware.check("VIEW_ALL_PERMISSIONS"), permissionsMiddleware.check("UPDATE_PERMISSION"), 
    permissionsMiddleware.check("DELETE_PERMISSION"), permissionsMiddleware.check("CREATE_PERMISSION"), 
    async (req: Request, res: Response) => { 
    permissionController.updatePermissionsByRole(req, res)
});


export default router;