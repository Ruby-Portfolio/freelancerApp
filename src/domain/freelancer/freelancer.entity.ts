import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { FreelancerErrorMessage } from './freelancer.message';

@Entity()
export class Freelancer {
  @PrimaryGeneratedColumn()
  id: number;

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
