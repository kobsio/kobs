// IPanelOptions is the interface for the options for a users panel used within a dashboard. It contains all required
// fields to reference a team.
export interface IPanelOptions {
  cluster?: string;
  namespace?: string;
  name?: string;
}
