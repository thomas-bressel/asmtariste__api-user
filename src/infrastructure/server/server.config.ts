/**
 * ServerConfig - Server configuration management
 * @version 2.1.0
 * @author Thomas Bressel
 * @since 2024-06-01
 */


/**
 * Class to manage the server configuration
 */
class ServerConfig {

  // Version of this configuration module
  public static readonly VERSION = '2.1.0';



  /**
   * 
   * Method to get the port address of the server.
   * 
   * @returns number
   */
  public static getApiListenPort(): number {
    const portConfig: string | undefined = process.env.API_LISTEN_PORT;
    return portConfig !== undefined ? parseInt(portConfig) : (
      () => {
        console.error("No address port defined for the server");
        process.exit(1);
      }
    )();
  }



  /**
   * 
   * Method to get the API name.
   * 
   * @returns number
   */
  public static getName(): string {
    const nameConfig: string | undefined = process.env.API_NAME;
    return nameConfig !== undefined ? nameConfig : (
      () => {
        console.error("No name defined for the API");
        process.exit(1);
      }
    )();
  }



  /**
   * 
   * Method to get the port address of the server.
   * 
   * @returns number
   */
  public static getVersion(): string {
    const versionConfig: string | undefined = process.env.API_VERSION;
    return versionConfig !== undefined ? versionConfig : (
      () => {
        console.error("No version defined for the API");
        process.exit(1);
      }
    )();
  }


  
  /**
  * Method to get the module version
  * @returns string
  */
  public static getServerConfigVersion(): string {
    return ServerConfig.VERSION;
  }
}

export default ServerConfig;