

// Libraries imports
import { IsNotEmpty, Matches, IsString, Min, IsInt, Length, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ValidateCreateUserDTO {

  @IsNotEmpty({ message: 'Le pseudo est requis' })
  @IsString({ message: 'Le pseudo doit être une chaîne de caractères' })
  @Length(3, 25, { message: 'Le pseudo doit contenir entre 3 et 25 caractères' })


  // Delete all spaces
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
  
    @IsNotEmpty({ message: 'L\'email est requis' })
    @IsString({ message: 'L\'email doit être une chaîne de caractères' })
    @IsEmail({}, { message: 'Le format de l\'email est invalide' })
    @Length(5, 254, { message: 'L\'email doit contenir entre 5 et 254 caractères' })
    @Transform(({ value }) => 
      typeof value === 'string' ? value.toLowerCase().trim() : value
    )
    @Matches(/^[^<>\"'%;()&+]*$/, {
      message: 'L\'email contient des caractères potentiellement dangereux'
    })
    email!: string;
  
    @IsNotEmpty({ message: 'Le rôle est requis' })
    @IsInt({ message: 'L\'ID du rôle doit être un nombre entier' })
    @Min(1, { message: 'L\'ID du rôle doit être supérieur à 0' })
    @Transform(({ value }) => {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    })
    id_role!: number;
  }