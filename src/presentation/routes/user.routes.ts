// Express importation
import express, {Request, Response} from "express";

// Layers importation
import UserController  from '../controllers/user.controller'; 
import UserService from '../../data/services/user.service';
import UserRepository from "../../data/repositories/user.repository";

// Middlewares import
import BodyParserMiddleware from "../middlewares/body-parser.middleware";
import CsrfMiddleware from "../middlewares/csrf.middleware";

const router = express.Router();
const csrfMiddleware = new CsrfMiddleware();

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService);

router.use(BodyParserMiddleware.urlEncodedParser);


// Routes that will implement csrf middleware
router.get("/user/v1/admin/users", async (req: Request, res: Response) =>  
    { userController.getAllUsers(req, res) });

export default router;