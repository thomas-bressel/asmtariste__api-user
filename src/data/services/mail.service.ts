/**
 * Service for handling email operations using Nodemailer.
 * 
 * @version 1.0.0
 * @author Thomas Bressel
 * @since 2025-07-23
 * 
 * @security This service handles email configuration and sending operations.
 * It requires proper environment variables for SMTP configuration and
 * implements secure email transport with TLS support.
 * 
 * @remarks
 * - Ensure that all required environment variables are set:
 *   MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_AUTH_USER, MAIL_AUTH_PWD
 * - The service throws errors if any required configuration is missing
 * - TLS is configured with rejectUnauthorized: false for development
 * - Email templates are currently hardcoded for user account creation
 */

// Libraries import
import nodemailer from 'nodemailer';

// Models import
import { MailOptionsModel } from '../../presentation/models/mail.model';

class MailService {

    constructor() {
        this.createEmailOptions = this.createEmailOptions.bind(this);
        this.sendMail = this.sendMail.bind(this);
        this.stat = this.stat.bind(this);
        this.testConnection = this.testConnection.bind(this);
    }




    
    /**
     * Get SMTP host from environment variables.
     * @returns SMTP server hostname
     * @throws Error if MAIL_HOST is not defined
     */
    public get host(): string {
        const host = process.env.MAIL_HOST;
        return host ? host : (() => { 
            throw new Error('Error: Missing MAIL_HOST environment variable'); 
        })();
    }




    
    /**
     * Get SMTP port from environment variables.
     * @returns SMTP server port number
     * @throws Error if MAIL_PORT is not defined or invalid
     */
    public get port(): number {
        const port = process.env.MAIL_PORT;
        if (!port) throw new Error('Error: Missing MAIL_PORT environment variable');
        
        const parsedPort = parseInt(port, 10);
        if (isNaN(parsedPort) || parsedPort <= 0) {
            throw new Error('Error: MAIL_PORT must be a valid positive number');
        }
        
        return parsedPort;
    }




    
    /**
     * Get SMTP secure setting from environment variables.
     * @returns Whether to use secure connection (TLS/SSL)
     * @throws Error if MAIL_SECURE is not defined
     */
    public get secure(): boolean {
        const secure = process.env.MAIL_SECURE;
        if (secure === undefined) {
            throw new Error('Error: Missing MAIL_SECURE environment variable');
        }
        return secure.toLowerCase() === 'true';
    }




    
    /**
     * Get SMTP authentication username from environment variables.
     * @returns SMTP authentication username
     * @throws Error if MAIL_AUTH_USER is not defined
     */
    public get authUser(): string {
        const user = process.env.MAIL_AUTH_USER;
        return user ? user : (() => { 
            throw new Error('Error: Missing MAIL_AUTH_USER environment variable'); 
        })();
    }




    
    /**
     * Get SMTP authentication password from environment variables.
     * @returns SMTP authentication password
     * @throws Error if MAIL_AUTH_PWD is not defined
     */
    public get authPassword(): string {
        const password = process.env.MAIL_AUTH_PWD;
        return password ? password : (() => { 
            throw new Error('Error: Missing MAIL_AUTH_PWD environment variable'); 
        })();
    }




    
    /**
     * Create and configure Nodemailer transporter with SMTP settings.
     * @returns Configured Nodemailer transporter instance
     */
    public get transporter() {
        return nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.secure, // true for 465, false for other ports
            auth: {
                user: this.authUser,
                pass: this.authPassword,
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates in development
            },
            // ✅ Options supplémentaires pour compatibilité
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
        });
    }




    
    /**
     * Test SMTP connection to verify configuration.
     * @returns Promise<boolean> True if connection successful
     */
    public async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP connection successful');
            return true;
        } catch (error) {
            console.error('❌ SMTP connection failed:', error);
            return false;
        }
    }




    
    /**
     * Create email options for user account creation notification.
     * Generates a welcome email with login credentials for new users.
     * 
     * @param email - User's email address
     * @param nickname - User's nickname/username
     * @param password - Temporary password
     * @returns MailOptionsModel configured email options
     */
    public createEmailOptions(email: string, nickname: string, password: string): MailOptionsModel {
        const mailOptions: MailOptionsModel = {
            from: this.getFromAddress(),
            to: email,
            subject: 'ASMtariSTe : Accès à l\'administration de Asmtariste',
            html: this.generateWelcomeEmailTemplate(nickname, password)
        };

        console.log('Email options created:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        return mailOptions;
    }




    
    /**
     * Send email using the configured transporter.
     * Verifies transporter configuration before sending.
     * 
     * @param mailOptions - Email options including to, from, subject, and content
     * @returns Promise<any> Email sending result
     * @throws Error if transporter verification fails or email sending fails
     */
    public async sendMail(mailOptions: MailOptionsModel): Promise<any> {
        try {
            // Verify transporter configuration
            await this.transporter.verify();
            console.log('Transporter configuration verified successfully.');

            // Send the email
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.response);
            
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }




    
    /**
     * Analyze and log email sending statistics.
     * Reports accepted and rejected email addresses.
     * 
     * @param emailResponse - Response object from Nodemailer containing accepted/rejected arrays
     */
    public stat(emailResponse: {
        accepted?: string[];
        rejected?: string[];
    }): void {
        if (!emailResponse) {
            console.warn('No email response provided for statistics');
            return;
        }

        if (emailResponse.rejected && emailResponse.rejected.length > 0) {
            console.log('MAIL SERVICE - Rejected emails:', emailResponse.rejected);
        }

        if (emailResponse.accepted && emailResponse.accepted.length > 0) {
            console.log('MAIL SERVICE - Accepted emails:', emailResponse.accepted);
        }

        // Log summary
        const acceptedCount = emailResponse.accepted?.length || 0;
        const rejectedCount = emailResponse.rejected?.length || 0;
        console.log(`MAIL SERVICE - Email statistics: ${acceptedCount} accepted, ${rejectedCount} rejected`);
    }




    
    /**
     * Get the sender email address.
     * @returns Configured sender email address
     */
    private getFromAddress(): string {
        return process.env.MAIL_FROM_ADDRESS || 'no-reply@asmtariste.fr';
    }




    
    /**
     * Generate HTML template for welcome email.
     * @param nickname - User's nickname/username
     * @param password - Temporary password
     * @returns HTML email template
     */
    private generateWelcomeEmailTemplate(nickname: string, password: string): string {
        const backofficeUrl = process.env.BACKOFFICE_URL || 'https://backoffice.asmtariste.fr/';
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Bienvenue dans l'administration ASMtariSTe !</h2>
                
                <p>Bonjour <strong>${nickname}</strong> !</p>
                
                <p>Tu as l'immense honneur d'avoir accès à l'administration de la secte Asmtariste à l'adresse 
                   <a href="${backofficeUrl}" style="color: #007bff;">${backofficeUrl}</a>
                </p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Tes identifiants de connexion :</strong></p>
                    <p><strong>Nom d'utilisateur :</strong> ${nickname}</p>
                    <p><strong>Mot de passe :</strong> ${password}</p>
                </div>
                
                <p><em>Note :</em> Quand l'administrateur suprême aura activé ton compte, tu pourras te connecter avec ces identifiants.</p>
                <p>Tu pourras changer ton mot de passe une fois connecté.</p>
                
                <hr style="margin: 30px 0;">
                
                <p>À bientôt !</p>
                <p><strong>L'équipe ASMtariSTe</strong></p>
            </div>
        `;
    }




    
    /**
     * Validate email configuration on service initialization.
     * @throws Error if any required environment variable is missing
     */
    public validateConfiguration(): void {
        try {
            // Trigger all getters to validate configuration
            const config = {
                host: this.host,
                port: this.port,
                secure: this.secure,
                user: this.authUser,
                password: this.authPassword
            };
            
            console.log('Mail service configuration validated successfully');
        } catch (error) {
            console.error('Mail service configuration validation failed:', error);
            throw error;
        }
    }
}

export default MailService;