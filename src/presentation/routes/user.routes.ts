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
import MultipartMiddleware from "../middlewares/multipart.middleware";

const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();
const permissionMiddleware = new PermissionMiddleware();

const userRepository = new UserRepository()
const mailService = new MailService();
const userService = new UserService(userRepository, mailService)
const userController = new UserController(userService);

router.use(BodyParserMiddleware.urlEncodedParser);
router.use(BodyParserMiddleware.jsonParser);

const prepareUpload = MultipartMiddleware.storeFileInMemory();



// Routes for user session management
router.get("/user/v1/admin/users", csrfMiddleware.authToken,  permissionMiddleware.check("VIEW_ALL_USERS"), async (req: Request, res: Response) => { 
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
router.get("/user/v1/admin/password/generate", async (req: Request, res: Response) =>  {
    userController.generateHashedPassword(req, res)
});



// Routes for user state management
router.get("/user/v1/admin/user", csrfMiddleware.authToken, async (req: Request, res: Response) => { 
    userController.getUserByUuid(req, res)
});
router.post("/user/v1/admin/user/create", csrfMiddleware.authToken, permissionMiddleware.check("CREATE_USER"), async (req: Request, res: Response) => { 
    userController.createUser(req, res)
});
router.put("/user/v1/admin/user/update", csrfMiddleware.authToken, permissionMiddleware.check("UPDATE_USER"), prepareUpload.single('file'), async (req: Request, res: Response) => { 
    userController.updateUser(req, res)
});
router.patch("/user/v1/admin/user/activate/:uuid", csrfMiddleware.authToken, permissionMiddleware.check("ACTIVATE_USER"), async (req: Request, res: Response) => { 
    userController.toggleActivate(req, res)
});
router.patch("/user/v1/admin/user/ghost/:uuid", csrfMiddleware.authToken, permissionMiddleware.check("GHOST_USER"), async (req: Request, res: Response) => { 
    userController.ghostUser(req, res)
});
router.delete("/user/v1/admin/user/delete/:uuid", csrfMiddleware.authToken, permissionMiddleware.check("DELETE_USER"), async (req: Request, res: Response) => { 
    userController.deleteUser(req, res)
});



export default router;