import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Freelancer } from '../freelancer/freelancer.entity';
import { JobPosting } from '../jobPosting/jobPosting.entity';
import { SupportState } from './supportHistory.enum';

@Entity()
export class SupportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', name: 'supportState', enum: SupportState })
  supportState: SupportState;

  @ManyToOne(() => Freelancer)
  freelancer: Freelancer;

  @ManyToOne(() => JobPosting)
  jobPosting: JobPosting;
}
