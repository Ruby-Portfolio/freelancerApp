import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class JobPosting {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column()
  company: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User)
  user: User;
}
