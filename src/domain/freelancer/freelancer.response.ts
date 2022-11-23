import { Position } from './freelancer.enum';

// export class FreelancerList extends PickType(Freelancer, [
//   'aboutMe',
//   'career',
//   'skills',
//   'position',
// ] as const) {}

export class FreelancerList {
  username: string;
  position: Position;
}
