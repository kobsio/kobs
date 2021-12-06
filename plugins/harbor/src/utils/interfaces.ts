// IPage is the interface for pagination.
export interface IPage {
  page: number;
  pageSize: number;
}

// IPanelOptions is the interface for the options property for the Harbor panel component.
export interface IPanelOptions {
  type?: string;
  repositories?: IPanelOptionsRepositories;
  artifacts?: IPanelOptionsArtifacts;
}

export interface IPanelOptionsRepositories {
  projectName?: string;
  query?: string;
}

export interface IPanelOptionsArtifacts {
  projectName?: string;
  repositoryName?: string;
  query?: string;
}

// IProjectsData is the data returned by our API. It contains a list of projects and the total number of projects.
export interface IProjectsData {
  projects: IProject[];
  total: number;
}

// IProject is the interface of a single project returned by the Harbor API.
export interface IProject {
  name: string;
  deleted: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  repo_count: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  chart_count: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  project_id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  registry_id: number;
  metadata: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    enable_content_trust: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_scan: string;
    severity: string;
    public: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    reuse_sys_cve_allowlist: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    prevent_vul: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    retention_id: string;
  };
}
// IRepositoriesData is the data returned by our API. It contains a list of repositories and the total number of
// repositories.
export interface IRepositoriesData {
  repositories: IRepository[];
  total: number;
}

export interface IRepository {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  artifact_count: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  creation_time: string;
  id: number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  project_id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pull_count: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  update_time: string;
}

// IArtifactsData is the data returned by our API. It contains a list of artifacts and the total number of artifacts.
export interface IArtifactsData {
  artifacts: IArtifact[];
  total: number;
}

export interface IArtifact {
  digest: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  extra_attrs: {
    architecture: string;
    author: string;
    config: {
      Cmd?: string[];
      Entrypoint?: string[];
      Env?: string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ExposedPorts?: { [key: string]: any };
      Labels?: { [key: string]: string };
      User?: string;
      WorkingDir?: string;
    };
    created: string;
    os: string;
  };
  icon: string;
  id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  manifest_media_type: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  media_type: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  project_id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pull_time: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  push_time: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  references?: IArtifactReference[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  repository_id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scan_overview: { [key: string]: IArtifactScanOverview };
  size: number;
  tags: IArtifactTag[];
  type: string;
}

export interface IArtifactReference {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  child_digest: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  child_id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  parent_id: number;
  platform: {
    OsFeatures: string[];
    architecture: string;
    os: string;
  };
  urls: string[];
}

export interface IArtifactScanOverview {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  complete_percent: number;
  duration: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  end_time: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  report_id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scan_status: string;
  severity: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  start_time: string;
}

export interface IArtifactTag {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  artifact_id: number;
  id: number;
  immutable: boolean;
  name: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pull_time: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  push_time: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  repository_id: number;
  signed: boolean;
}

export interface IVulnerabilities {
  [key: string]: IVulnerability;
}

export interface IVulnerability {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  generated_at: string;
  scanner: {
    name: string;
    vendor: string;
    version: string;
  };
  severity: string;
  vulnerabilities: IVulnerabilityDetails[];
}

export interface IVulnerabilityDetails {
  id: string;
  package: string;
  version: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fix_version: string;
  severity: string;
  description: string;
  links: string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  artifact_digests: string[];
}

export interface IBuildHistoryItem {
  created: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_by: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  empty_layer?: boolean;
}
