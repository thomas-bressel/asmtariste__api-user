// Express importation
import express, {Request, Response} from "express";

// Layers importation
import UserController  from '../controllers/user.controller'; 
import UserService from '../../data/services/user.service';
import UserRepository from "../../data/repositories/user.repository";

// Middlewares import
import BodyParserMiddleware from "../middlewares/body-parser.middleware";
import CsrfMiddleware from "../middlewares/csrf.middleware";
import PermissionMiddleware from "../middlewares/permission.middleware";
import MailService from "../../data/services/mail.service";


const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();
const permissionMiddleware = new PermissionMiddleware();

const userRepository = new UserRepository()
const mailService = new MailService();
const userService = new UserService(userRepository, mailService)
const userController = new UserController(userService);

router.use(BodyParserMiddleware.urlEncodedParser);
router.use(BodyParserMiddleware.jsonParser);




// Routes that will implement csrf middleware and permission middleware
router.get("/user/v1/admin/users", csrfMiddleware.authToken, async (req: Request, res: Response) => { 
    userController.getAllUsers(req, res)
});
router.post("/user/v1/admin/login", async (req: Request, res: Response) => {
    userController.createSession(req, res)
});
router.get("/user/v1/admin/logout", csrfMiddleware.authToken, async (req: Request, res: Response) => {
    userController.deleteSession(req, res)
});
router.post("/user/v1/admin/refresh", csrfMiddleware.authRefresh, async (req: Request, res: Response) => {
    userController.refreshSession(req, res)
});
router.get("/user/v1/admin/verify", csrfMiddleware.authToken, async (req: Request, res: Response) =>  {
    userController.verifySession(req, res)
});

router.post("/user/v1/admin/user/create", csrfMiddleware.authToken, permissionMiddleware.check("CREATE_USER"), async (req: Request, res: Response) => { 
    userController.createUser(req, res)
});



export default router;