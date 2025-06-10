/**
 * Middleware for parsing HTTP request bodies
 * 
 * @version 1.0.0
 * @author Thomas Bressel
 * @since 2025-06-09
 * 
 * @decorator Static - This class only exposes static methods for middleware usage
 * 
 * @remarks 
 * - This middleware provides parsing for `application/json` and `application/x-www-form-urlencoded` content types.
 * - Internally uses the `body-parser` library to handle the transformation of raw request bodies into usable JavaScript objects.
 * - `urlEncodedParser` supports extended syntax with rich objects and arrays.
 * - Designed to be reusable and composable within any Express application.
 * @security This middleware processes client-sent data and must be used before accessing `req.body`.
 */


import { Request, Response, NextFunction } from "express";
import { Frozen } from "../../shared/utils/decorators/security.decorator";
import bodyParser from "body-parser";



@Frozen
class BodyParserMiddleware {

    
    
/**
 * 
 * Middleware to parse url encoded data
 * Analyse HTTP request body and convert it into a string or object
 * 
 * data types: application/x-www-form-urlencoded
 * 
 * @param req : Therequest object reveived from the client
 * @param res : The response object to send back to the client
 * @param next : The next function to call the next middleware
 */
public static urlEncodedParser(req: Request, res: Response, next: NextFunction) {
    bodyParser.urlencoded({
        extended: true 
    })
    (req, res, next);
}

/**
 * 
 * Middleware to parse json data
 * Analyse HTTP request body and convert it into a string or object
 *
 * data types: application/json
 *  
 * @param req : The request object reveived from the client
 * @param res : The response object to send back to the client
 * @param next : The next function to call the next middleware
 */
public static jsonParser(req: Request, res: Response, next: NextFunction) {
    bodyParser.json()
    (req, res, next);
}

}

export default BodyParserMiddleware