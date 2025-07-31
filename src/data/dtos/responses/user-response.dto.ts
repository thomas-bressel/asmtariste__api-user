import  User  from '../../../domain/entities/user.entity';


export class UserResponseDTO {
  constructor(
    public uuid: string,
    public nickname: string,
    public email: string,
    public firstname: string | undefined,
    public lastname: string | undefined,
    public avatar: string,
    public registration_date: Date,
    public last_login: Date,
    public is_activated: boolean | number,
    public id_role: number
  ) {}

  /**
   * Methode to convert an Entity into a DTO
   * @param user 
   * @returns 
   */
  static fromEntity(user: User): UserResponseDTO {
    return new UserResponseDTO(
      user.uuid,
      user.nickname,
      user.email,
      user.firstname,
      user.lastname,
      user.avatar,
      user.registration_date,
      user.last_login,
      user.is_activated,
      user.id_role,
    );
  }


  
  /**
   * Method to convert a list of entity into a DTO
   * @param users 
   * @returns 
   */
  static fromEntities(users: User[]): UserResponseDTO[] {
    return users.map((user) => UserResponseDTO.fromEntity(user));
  }


}