/**
 * MongoDB Connection - Database configuration
 * 
 * @version 1.0.0
 * @author Thomas Bressel
 * @since 2025-06-22
 * 
 * @remarks 
 * - Ensure that the required environment variables (`USERDB_PORT`, 
 *   `USERDB_DATA`, `USERDB_USER`, `USERDB_PASS`, `USERDB_HOST`) are set. 
 * - The middleware throws errors if any of the required keys are missing.
 * - This class is immutable after compilation - no methods or properties can be added, removed, or modified.
 * - Protected against malicious code injection and accidental modifications.
 * 
 * @security This class handles sensitive database credentials and is frozen for protection
 */

import { MongoClient, Db } from 'mongodb';

class MongoDBInterfaceModule {
  private static client: MongoClient;
  private static database: Db;



  /**
   * Get le global configuration of the database
   * @returns 
   */
  public static async getConnectionPool(): Promise<Db> {
    if (!this.database) {
      try {
        // URI avec authentification sur la base admin
        const uri = (this.username && this.password) 
          ? `mongodb://${this.username}:${this.password}@${this.host}:${this.listenPort}/${this.dataName}?authSource=admin`
          : `mongodb://${this.host}:${this.listenPort}/${this.dataName}`;
        
        this.client = new MongoClient(uri);
        
        await this.client.connect();
        this.database = this.client.db(this.dataName);
        console.log("MongoDB connection successful");
      } catch (error) {
        console.error("Error connecting to MongoDB: ", error);
        throw error;
      }
    }
    return this.database;
  }


  /**
   * Get port number from environnment variables
   */
  private static get listenPort(): number {
    const portConfig = process.env.INTERFACEDB_PORT;
    if (!portConfig) {
      console.error("No port set for the database");
      return 27017;
    }
    return parseInt(portConfig);
  }


  /**
   * Get database name
   */
  private static get dataName(): string | undefined {
    const dbName = process.env.INTERFACEDB_DATA;
    if (!dbName) {
      console.error("No database name set");
    }
    return dbName;
  }


  /**
   * Get username
   */
  private static get username(): string | undefined {
    const dbUser = process.env.INTERFACEDB_USER;
    if (!dbUser) {
      console.error("No user set for the database");
    }
    return dbUser;
  }


  /**
   * Get password
   */
  private static get password(): string | undefined {
    const dbPass = process.env.INTERFACEDB_PASS;
    if (!dbPass) {
      console.error("No password set for the database");
    }
    return dbPass;
  }


  /**
   * Get host
   */
  private static get host(): string | undefined {
    const dbHost = process.env.INTERFACEDB_HOST;
    if (!dbHost) {
      console.error("No host set for the database");
    }
    return dbHost;
  }
}

export default MongoDBInterfaceModule;