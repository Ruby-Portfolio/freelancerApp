import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  aboutMe: string;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  career: string;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  skills: string;

  @ManyToOne(() => User)
  user: User;
}
