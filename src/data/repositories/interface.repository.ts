import MongoDBInterfaceModule from "../../infrastructure/database/mongodb-interface.connexion";
import { Db, Collection } from 'mongodb';

class InterfaceRepository {
    private db!: Db;

    constructor() {
        this.initializeConnection();
    }

    private async initializeConnection(): Promise<void> {
        try {
            this.db = await MongoDBInterfaceModule.getConnectionPool();
        } catch (error) {
            console.error("Error initializing InterfaceRepository:", error);
            throw error;
        }
    }

    /**
     * Get document by type from specified collection
     */
    public async getDefaultInterfaceByType(collectionName: string, type: string): Promise<any> {
        try {
            const collection: Collection = this.db.collection(collectionName);
            const result = await collection.findOne({ type: type });
            return result;
        } catch (error) {
            console.error("Error getting document by name:", error);
            throw error;
        }
    }
}

export default InterfaceRepository;