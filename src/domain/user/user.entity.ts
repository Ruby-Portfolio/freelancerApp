import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @IsString()
  provider: string;

  @Column({ length: 100 })
  @IsString()
  providerId: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Column()
  email: string;
}
