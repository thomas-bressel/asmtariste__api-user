import { Request, Response } from 'express';
import UserController from '../../../src/presentation/controllers/user.controller';
import UserService from '../../../src/data/services/user.service';
import { UserResponseDTO } from '../../../src/data/dtos/user-response.dto';
import { UserRoleResponseDTO } from '../../../src/data/dtos/user-role-response.dto';
import User from '../../../src/domain/entities/user.entity';


describe('UserController - Unit Tests for getAlluser', () => {
    let mockUserService: jest.Mocked<UserService>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockResponse: Partial<Response>;
    let userController: UserController;



    beforeEach(() => {
        // UserService mock
        mockUserService = {
            getAllUsers: jest.fn(),
            getAllUsersWithRole: jest.fn(),
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
            expect(mockJson).toHaveBeenCalledWith({ message: `Paramètre 'undefined' non reconnu` });
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
            expect(mockJson).toHaveBeenCalledWith({ message: `Paramètre '' non reconnu` });
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
                expect(mockJson).toHaveBeenCalledWith({ message: `Paramètre '${value}' non reconnu` });
            }
        });


        it('should throw error when service returns undefined', async () => {
            // Arrange
            mockUserService.getAllUsers.mockResolvedValue(undefined as any);
            jest.spyOn(console, 'error').mockImplementation(() => { });

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


        it("should return 400 for unrecognized option", async () => {
            //Arrange
            const req = { query: { option: 'banana' } } as Partial<Request>;

            // Act
            await userController.getAllUsers(req as Request, mockResponse as Response);

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: "Paramètre 'banana' non reconnu" });
        });


        it("should return 500 if userService.getAllUsersWithRole throws error", async () => {
            mockUserService.getAllUsersWithRole.mockRejectedValue(new Error("Service unavailable"));

            const req = { query: { option: "role" } } as Partial<Request>;

            await userController.getAllUsers(req as Request, mockResponse as Response);

            expect(mockUserService.getAllUsersWithRole).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Service unavailable" });
        });

        it('should return 500 on unexpected error', async () => {
            mockUserService.getAllUsersWithRole.mockRejectedValue(new Error("Service failed"));

            const mockRequest = {
                query: { option: 'role' }
            } as unknown as Request;

            await userController.getAllUsers(mockRequest, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Service failed" });
        });


        it('should return 500 when getAllUsersWithRole returns null', async () => {
            mockUserService.getAllUsersWithRole.mockResolvedValue(null as unknown as UserRoleResponseDTO[]);

            const mockRequest = {
                query: { option: 'role' }
            } as unknown as Request;

            await userController.getAllUsers(mockRequest, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Résultat vide dans users" });
        });


        it('should return 500 and error message when userService.getAllUsersWithRole throws', async () => {
            const mockError = new Error('Erreur simulée dans le service');

            // Mock de l'erreur levée par le service
            mockUserService.getAllUsersWithRole.mockRejectedValue(mockError);

            const mockRequest: Partial<Request> = {
                query: { option: 'role' }
            };

            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockUserService.getAllUsersWithRole).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erreur simulée dans le service' });
        });


        it('should return 500 with default error message when error is not an instance of Error', async () => {
            mockUserService.getAllUsersWithRole.mockRejectedValue("string error");

            const mockRequest: Partial<Request> = {
                query: { option: 'role' }
            };

            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Erreur interne du serveur" });
        });
    });


    describe('getAllUsers - Service response validation', () => {
        it('should call the user service and return 200 when option is all', async () => {

            // Arrange
            const mockUserEntity: User = new User(
                1,
                "5ea1d354-67b7-4ac7-967e-ef7b4d74e5ec",
                "zisquier",
                "tbressel.dev@gmail.com",
                "hashedpassword",
                "Thomas",
                "Bressel",
                "ozzy.webp",
                new Date("2025-04-01T19:15:52.000Z"),
                new Date("2025-06-12T18:09:00.000Z"),
                true,
                1
            );

            const mockUsers: UserResponseDTO[] = UserResponseDTO.fromEntities([mockUserEntity]);
            mockUserService.getAllUsers.mockResolvedValue(mockUsers);
            let mockRequest: Partial<Request> = { query: { option: 'all' } };

            // Act
            await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

            //Assert
            expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockUsers);
        });


        it("should return 200 and list of users with roles when option is 'role'", async () => {

            const mockUsersWithRole = [
                {
                    uuid: "5ea1d354-67b7-4ac7-967e-ef7b4d74e5ec",
                    nickname: "zisquier",
                    email: "tbressel.dev@gmail.com",
                    firstname: "Thomas",
                    lastname: "Bressel",
                    avatar: "ozzy-c0ec2570-56bd-4404-befa-7a59a7edb573.webp",
                    registration_date: new Date("2025-04-01T19:15:52.000Z"),  // <-- ici Date au lieu de string
                    last_login: new Date("2025-06-12T18:09:00.000Z"),          // <-- idem
                    is_activated: true,
                    role_name: "Administrateur",
                    role_color: "red"
                }
            ];

            mockUserService.getAllUsersWithRole.mockResolvedValue(mockUsersWithRole);

            const req = { query: { option: "role" } } as Partial<Request>;

            await userController.getAllUsers(req as Request, mockResponse as Response);

            expect(mockUserService.getAllUsersWithRole).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockUsersWithRole);
        });
    });



});