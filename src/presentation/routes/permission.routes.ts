// Express importation
import express, {Request, Response, NextFunction, RequestHandler} from "express";

// Controllers importation
import PermissionController from "../controllers/permission.controller";
import PermissionRepository from "../../data/repositories/permission.repository";
import PermissionService from "../../data/services/permission.service";

// Middlewares import
import BodyParserMiddleware from "../middlewares/body-parser.middleware";
import CsrfMiddleware from "../middlewares/csrf.middleware";


const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();
const permissionRepository = new PermissionRepository();
const permissionService = new PermissionService(permissionRepository);
const permissionController = new PermissionController(permissionService);


router.use(BodyParserMiddleware.urlEncodedParser);
router.use(BodyParserMiddleware.jsonParser);


router.get("/user/v1/admin/permission", csrfMiddleware.authToken, async (req: Request, res: Response) => { 
    permissionController.getPermissionsByUserUuid(req, res)
});

export default router;