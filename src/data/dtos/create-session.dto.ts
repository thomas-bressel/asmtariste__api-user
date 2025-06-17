import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateSessionDTO {
  @IsString()
  @IsNotEmpty()
  @Length(4, 25, {
    message: "Le nickname doit être entre 4 et 25 caractères",
  })
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 25, {
    message: "Le mot de passe doit être entre 4 et 25 caractères",
  })
  password!: string;
}
