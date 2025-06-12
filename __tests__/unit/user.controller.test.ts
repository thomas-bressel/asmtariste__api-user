import { Request, Response } from 'express';
import UserController from '../../src/presentation/controllers/user.controller';
import UserService from '../../src/data/services/user.service';

describe('UserController - Unit Tests', () => {
    let mockUserService: jest.Mocked<UserService>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockResponse: Partial<Response>;
    let userController: UserController;



    beforeEach(() => {
        // UserService mock
        mockUserService = {
            getAllUsers: jest.fn()
        } as any;

        // Response mock
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });

        mockResponse = {
            status: mockStatus,
            json: mockJson
        };

        userController = new UserController(mockUserService);
    });


    describe('getAllUsers - Return of an error message', () => {
        it('should test if the http request contains the option query', async () => {
            // Arrange
            let mockRequest: Partial<Request> = {
                query: {
                    option: undefined
                }
            }

            // Act
            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: `Paramètre 'undefined' non reconnu`});
        });
        
        it('should return an error if the option is empty', async () => {
            // Arrange
            let mockRequest: Partial<Request> = {
                query: {
                    option: ''
                }
            }

            // Act
            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: `Paramètre '' non reconnu`});
        });
        it('should reject values different from \'all\' or \'role\'', async () => {

            // Arrange
            const testValues = ['admin', 'filter', 'roles', '123', ''];


            for (const value of testValues) {
                mockJson.mockClear();
                // Arrange
                let mockRequest: Partial<Request> = {
                    query: {
                        option: value
                    }
                }
                // Act
                await userController.getAllUsers(mockRequest as Request, mockResponse as Response);
                // Assert
                expect(mockJson).toHaveBeenCalledWith({ message: `Paramètre '${value}' non reconnu`});
            }
        });
        it('should throw error when service returns undefined', async () => {
            // Arrange
            mockUserService.getAllUsers.mockResolvedValue(undefined as any);
            jest.spyOn(console, 'error').mockImplementation(() => {});
            
            let mockRequest: Partial<Request> = {
                query: {
                    option: 'all'
                }
            }

            // Act
            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Résultat vide dans users' });
        });
    });


    describe('getAllUsers - Service response validation', () => {
        it('should call the user service and return 200 when option is all', async () => {
            // Arrange
            let mockRequest: Partial<Request> = {
                query: {
                    option: 'all'
                }
            }

            // Act
            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
        });

        
        
    });

});