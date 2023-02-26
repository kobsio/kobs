/**
 * The `ITeamOptions` interface defines all options which can be set by a user to get a list of teams on the
 * `TeamsPage`.
 */
export interface ITeamOptions {
  all?: boolean;
  page?: number;
  perPage?: number;
  searchTerm?: string;
}
