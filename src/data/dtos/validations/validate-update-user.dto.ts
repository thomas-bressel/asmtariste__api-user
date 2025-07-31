// validate-update-user.dto.ts
import { IsNotEmpty, Matches, IsString, Min, IsInt, Length, IsEmail, IsUUID, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ValidateUpdateUserDTO {

  @IsNotEmpty({ message: 'L\'UUID est requis' })
  @IsString({ message: 'L\'UUID doit être une chaîne de caractères' })
  @IsUUID(4, { message: 'L\'UUID doit être un UUID v4 valide' })
  uuid!: string;

  @IsNotEmpty({ message: 'Le pseudo est requis' })
  @IsString({ message: 'Le pseudo doit être une chaîne de caractères' })
  @Length(3, 25, { message: 'Le pseudo doit contenir entre 3 et 25 caractères' })
  @Transform(({ value }) => 
    typeof value === 'string' ? value.trim().replace(/\s+/g, '') : value
  )
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Le pseudo ne peut contenir que des lettres, chiffres, _ et -'
  })
  @Matches(/^[^<>\"'%;()&+]*$/, {
    message: 'Le pseudo contient des caractères potentiellement dangereux'
  })
  nickname!: string;

  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @Length(0, 25, { message: 'Le prénom doit contenir 25 caractères maximum' })
  @Transform(({ value }) => 
    typeof value === 'string' ? value.trim() : value
  )
  @Matches(/^[^<>\"'%;()&+]*$/, {
    message: 'Le prénom contient des caractères potentiellement dangereux'
  })
  firstname?: string;

  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Length(0, 50, { message: 'Le nom doit contenir 50 caractères maximum' })
  @Transform(({ value }) => 
    typeof value === 'string' ? value.trim() : value
  )
  @Matches(/^[^<>\"'%;()&+]*$/, {
    message: 'Le nom contient des caractères potentiellement dangereux'
  })
  lastname?: string;

  @IsNotEmpty({ message: 'L\'email est requis' })
  @IsString({ message: 'L\'email doit être une chaîne de caractères' })
  @IsEmail({}, { message: 'Le format de l\'email est invalide' })
  @Length(5, 50, { message: 'L\'email doit contenir entre 5 et 50 caractères' })
  @Transform(({ value }) => 
    typeof value === 'string' ? value.toLowerCase().trim() : value
  )
  @Matches(/^[^<>\"'%;()&+]*$/, {
    message: 'L\'email contient des caractères potentiellement dangereux'
  })
  email!: string;

  @IsOptional()
  @IsString({ message: 'L\'avatar doit être une chaîne de caractères' })
  avatar?: string;

  @IsNotEmpty({ message: 'Le rôle est requis' })
  @IsInt({ message: 'L\'ID du rôle doit être un nombre entier' })
  @Min(1, { message: 'L\'ID du rôle doit être supérieur à 0' })
  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? value : parsed;
  })
  id_role!: number;
}