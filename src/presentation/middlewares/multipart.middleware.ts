/**
 * Middleware for handling multipart file uploads and storage operations.
 * 
 * @version 1.0.0
 * @author Thomas Bressel
 * @since 2025-07-23
 * 
 * @security This middleware provides methods to handle file uploads both in memory
 * and on disk storage. It includes file validation, accent removal, and unique
 * filename generation for secure file handling.
 * 
 * @remarks
 * - Files are stored with unique UUID suffixes to prevent naming conflicts
 * - Accents are automatically removed from filenames for compatibility
 * - File size limits are enforced (default: 100KB)
 * - Proper directory structure is maintained automatically
 */

// Node.js imports
import fs from 'fs';
import path from 'path';

// Libraries import
import iconv from 'iconv-lite';
import { v4 as uuidv4 } from 'uuid';
import removeAccents from 'remove-accents';
import multer from 'multer';

// Types import
import { Request } from 'express';

class MultipartMiddleware {

    constructor() {
        // Bind methods if needed for instance usage
        this.processFileBuffer = this.processFileBuffer.bind(this);
    }

    /**
     * Save a file buffer from memory to disk storage.
     * Creates directory structure automatically and generates unique filenames.
     * 
     * @param fileBuffer - The file buffer to save
     * @param originalName - Original filename with extension
     * @param targetFolder - Target folder path (default: 'uploads/articles')
     * @returns The generated filename
     */
    public static saveFileFromMemory(
        fileBuffer: Buffer, 
        originalName: string, 
        targetFolder: string = 'uploads/articles'
    ): string {
        const processedFilename = this.generateUniqueFilename(originalName);
        const fullPath = this.ensureDirectoryExists(targetFolder);
        const filePath = path.join(fullPath, processedFilename);
        
        try {
            fs.writeFileSync(filePath, fileBuffer);
            return processedFilename;
        } catch (error) {
            throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Configure multer for disk storage with automatic filename processing.
     * 
     * @param targetFolder - Target folder for file storage (default: 'uploads/avatars')
     * @param fileSizeLimit - File size limit in bytes (default: 100KB)
     * @returns Configured multer instance
     */
    public static storeFileOnDisk(
        targetFolder: string = 'uploads/avatars',
        fileSizeLimit: number = 100 * 1024
    ): multer.Multer {
        const storage = multer.diskStorage({
            destination: (req: Request, file: Express.Multer.File, cb) => {
                this.ensureDirectoryExists(targetFolder);
                cb(null, targetFolder);
            },
            filename: (req: Request, file: Express.Multer.File, cb) => {
                try {
                    const decodedName = this.decodeFilename(file.originalname);
                    const processedFilename = this.generateUniqueFilename(decodedName);
                    cb(null, processedFilename);
                } catch (error) {
                    cb(error as Error, '');
                }
            }
        });

        return multer({
            storage: storage,
            limits: { fileSize: fileSizeLimit }
        });
    }

    /**
     * Configure multer for memory storage.
     * 
     * @param fileSizeLimit - File size limit in bytes (default: 100KB)
     * @returns Configured multer instance for memory storage
     */
    public static storeFileInMemory(fileSizeLimit: number = 100 * 1024): multer.Multer {
        const storage = multer.memoryStorage();

        return multer({
            storage: storage,
            limits: { fileSize: fileSizeLimit }
        });
    }

    /**
     * Process file buffer for custom handling (instance method example).
     * 
     * @param fileBuffer - The file buffer to process
     * @param originalName - Original filename
     * @returns Processed filename
     */
    public processFileBuffer(fileBuffer: Buffer, originalName: string): string {
        return MultipartMiddleware.saveFileFromMemory(fileBuffer, originalName);
    }

    /**
     * Generate a unique filename with accent removal and UUID suffix.
     * 
     * @param originalName - Original filename with extension
     * @returns Processed unique filename
     */
    private static generateUniqueFilename(originalName: string): string {
        const nameWithoutExtension = this.getFilenameWithoutExtension(originalName);
        const nameWithoutAccents = removeAccents(nameWithoutExtension);
        const extension = this.getFileExtension(originalName);
        const uniqueSuffix = uuidv4();
        
        return `${nameWithoutAccents}-${uniqueSuffix}.${extension}`;
    }

    /**
     * Ensure directory exists, create if necessary.
     * 
     * @param folder - Target folder path
     * @returns Full directory path
     */
    private static ensureDirectoryExists(folder: string): string {
        const directoryPath = path.join(__dirname, '../../', folder);
        
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
        
        return directoryPath;
    }

    /**
     * Decode filename from binary encoding to UTF-8.
     * 
     * @param filename - Encoded filename
     * @returns Decoded filename
     */
    private static decodeFilename(filename: string): string {
        return iconv.decode(Buffer.from(filename, 'binary'), 'utf-8');
    }

    /**
     * Extract filename without extension.
     * 
     * @param filename - Full filename
     * @returns Filename without extension
     */
    private static getFilenameWithoutExtension(filename: string): string {
        return filename.split('.')[0];
    }

    /**
     * Extract file extension.
     * 
     * @param filename - Full filename
     * @returns File extension
     */
    private static getFileExtension(filename: string): string {
        return filename.split('.').pop() || '';
    }
}

export default MultipartMiddleware;