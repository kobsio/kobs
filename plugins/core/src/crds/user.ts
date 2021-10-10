// The IUser interface implements the User CRD.
export interface IUser {
  cluster: string;
  namespace: string;
  name: string;
  id: string;
  fullName: string;
  email: string;
  position?: string;
  bio?: string;
  teams?: IUserTeamReference[];
}

export interface IUserTeamReference {
  cluster?: string;
  namespace?: string;
  name: string;
}
