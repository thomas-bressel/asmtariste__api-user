/**
 * The main server file for the React_Node application.
 * @module index
**/
// Express importation
import express, { Express } from "express";

// ConfigServer importation
import  ServerConfig  from "./infrastructure/server/server-config"

// user app components routes


// Color importation
import { CONSOLE_COLORS } from "./shared/constants/console-colors.constants";


// Middleware importation



const server: Express = express();

// get port server number from ServerConfig
server.listen(ServerConfig.getApiListenPort(), () => {
  console.warn(CONSOLE_COLORS.magenta, "Server listened on port number ", ServerConfig.getApiListenPort());
  console.warn(CONSOLE_COLORS.bgMagenta, `API NAME -> ${ServerConfig.getName()} - API VERSION -> ${ServerConfig.getVersion()}`);
});



server.get('/', (req, res) => {
  res.send('Asmtariste API public route');
}
);

export default server;