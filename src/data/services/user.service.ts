// Layer imports
import UserRepository from "../repositories/user.repository";

// Entity imports
import User from "../../domain/entities/user.entity";
import { UserResponseDTO } from "../dtos/user-response.dto";


class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }


  /**
   * Get the list of all users
   * @returns 
   */
  public async getAllUsers(): Promise<UserResponseDTO[]> {
    const users: User[] = await this.userRepository.getAllUsers();
    return UserResponseDTO.fromEntities(users);
  }




}

export default UserService;
