import { IReference } from './dashboard';

// The IUser interface implements the User CRD.
export interface IUser {
  id: string;
  satellite: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  email: string;
  rows?: IReference[];
}
