export const description =
  'An open source registry that secures artifacts with policies and role-based access control, ensures images are scanned and free from vulnerabilities, and signs images as trusted.';

// IProjectsData is the data returned by our API. It contains a list of projects and the total number of projects.
export interface IProjectsData {
  projects: IProject[];
  total: number;
}

// IProject is the interface of a single project returned by the Harbor API.
export interface IProject {
  chart_count: number;
  deleted: boolean;
  metadata: {
    auto_scan: string;
    enable_content_trust: string;
    prevent_vul: string;
    public: string;
    retention_id: string;
    reuse_sys_cve_allowlist: string;
    severity: string;
  };
  name: string;
  project_id: number;
  registry_id: number;
  repo_count: number;
}
// IRepositoriesData is the data returned by our API. It contains a list of repositories and the total number of
// repositories.
export interface IRepositoriesData {
  repositories: IRepository[];
  total: number;
}

export interface IRepository {
  artifact_count: number;
  creation_time: string;
  id: number;
  name: string;
  project_id: number;
  pull_count: number;
  update_time: string;
}

// IArtifactsData is the data returned by our API. It contains a list of artifacts and the total number of artifacts.
export interface IArtifactsData {
  artifacts: IArtifact[];
  total: number;
}

export interface IArtifact {
  digest: string;
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
  manifest_media_type: string;
  media_type: string;
  project_id: number;
  pull_time: string;
  push_time: string;
  references?: IArtifactReference[];
  repository_id: number;
  scan_overview: { [key: string]: IArtifactScanOverview };
  size: number;
  tags: IArtifactTag[];
  type: string;
}

export interface IArtifactReference {
  child_digest: string;
  child_id: number;
  parent_id: number;
  platform: {
    OsFeatures: string[];
    architecture: string;
    os: string;
  };
  urls: string[];
}

export interface IArtifactScanOverview {
  complete_percent: number;
  duration: number;
  end_time: string;
  report_id: string;
  scan_status: string;
  severity: string;
  start_time: string;
}

export interface IArtifactTag {
  artifact_id: number;
  id: number;
  immutable: boolean;
  name: string;
  pull_time: string;
  push_time: string;
  repository_id: number;
  signed: boolean;
}

export interface IVulnerabilities {
  [key: string]: IVulnerability;
}

export interface IVulnerability {
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
  artifact_digests: string[];
  description: string;
  fix_version: string;
  id: string;
  links: string[];
  package: string;
  severity: string;
  version: string;
}

export interface IBuildHistoryItem {
  created: string;
  created_by: string;
  empty_layer?: boolean;
}
