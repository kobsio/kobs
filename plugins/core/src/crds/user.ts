// The IUser interface implements the User CRD.
export interface IUser {
  cluster: string;
  namespace: string;
  name: string;
  id: string;
  profile: IUserProfile;
  teams?: IUserTeamReference[];
}

export interface IUserProfile {
  fullName: string;
  email: string;
  position?: string;
  bio?: string;
}

export interface IUserTeamReference {
  cluster?: string;
  namespace?: string;
  name: string;
}
