import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { FreelancerErrorMessage } from './freelancer.message';
import { Position } from './freelancer.enum';
import { IsPosition } from './freelancer.validator';

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn()
  id: number;

  @IsPosition({ message: FreelancerErrorMessage.POSITION_INVALID })
  @Column({ type: 'enum', name: 'position', enum: Position })
  position: Position;

  @IsString()
  @IsNotEmpty({ message: FreelancerErrorMessage.ABOUT_ME_EMPTY })
  @Column({ type: 'text' })
  aboutMe: string;

  @IsString()
  @IsNotEmpty({ message: FreelancerErrorMessage.CAREER_EMPTY })
  @Column({ type: 'text' })
  career: string;

  @IsString()
  @IsNotEmpty({ message: FreelancerErrorMessage.SKILLS_EMPTY })
  @Column({ type: 'text' })
  skills: string;

  @Column('int', { nullable: true, name: 'userId' })
  userId: number;

  @ManyToOne(() => User)
  user: User;
}
