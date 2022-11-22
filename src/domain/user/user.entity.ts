import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Column()
  email: string;

  @IsNotEmpty()
  @Column()
  password: string;

  @IsMobilePhone()
  @IsNotEmpty()
  @Column()
  phone: string;
}
