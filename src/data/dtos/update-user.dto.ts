// update-user.dto.ts
import User from '../../domain/entities/user.entity';

export class UpdateUserDTO {
  constructor(
    public uuid: string,
    public nickname: string,
    public email: string,
    public id_role: number,
    public firstname?: string,
    public lastname?: string,
    public avatar?: string,
  ) {}

  /**
   * Convert DTO to User entity for update operations
   * @param userFile 
   * @returns 
   */
  public toEntity(userFile?: Express.Multer.File): User {
    let avatar: string;

    console.log('Field Name : ', userFile?.fieldname)
    console.log('OriginalName : ', userFile?.originalname)

    // If there is no file sent from the form, then avatar = avatar
    if (!userFile?.fieldname) {
      console.log('Il n\'y a aucun fichier, avatar = avatar', this.avatar)
      avatar = this.avatar || 'default-avatar.webp';
    } else if (userFile?.originalname) {
      // If a file is sent from the form, the avatar = filename 
      console.log('Il a un fichier, avatar = originalname', userFile?.originalname)
      avatar = userFile?.originalname;
    } else {
      avatar = this.avatar || 'default-avatar.webp';
    }

    // Créer l'instance User en respectant l'ordre exact du constructeur
    const user = new User(
      null, // id_user: number | null
      this.uuid, // uuid: string
      this.nickname, // nickname: string
      this.email, // email: string
      '', // hash_password: string - vide car non modifié lors de l'update
      this.firstname, // firstname: string | undefined
      this.lastname, // lastname: string | undefined
      new Date(), // registration_date: Date
      new Date(), // last_login: Date
      true, // is_activated: boolean
      this.id_role, // id_role: number
      avatar // avatar: string
    );

    return user;
  }

  /**
   * Create UpdateUserDTO from validated data
   * @param validatedData 
   * @returns 
   */
  static fromValidatedData(validatedData: any): UpdateUserDTO {
    return new UpdateUserDTO(
      validatedData.uuid,
      validatedData.nickname,
      validatedData.email,
      validatedData.id_role,
      validatedData.firstname,
      validatedData.lastname,
      validatedData.avatar
    );
  }
}