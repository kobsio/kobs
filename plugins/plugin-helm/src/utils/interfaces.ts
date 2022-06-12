import { ITimes } from '@kobsio/shared';

// IOptions is the interface for the options of the page implementation of the Helm plugin.
export interface IOptions {
  clusters: string[];
  namespaces: string[];
  times: ITimes;
}

// IPanelOptions is the interface for the options property in the plugin panel implementation for the Helm plugin.
export interface IPanelOptions {
  type?: string;
  clusters?: string[];
  namespaces?: string[];
  name?: string;
}

// IRelease is the interface for a single Helm release.
export interface IRelease {
  cluster?: string;
  name?: string;
  info?: IInfo;
  chart?: IChart;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: { [key: string]: any };
  manifest?: string;
  hooks?: (IHook | undefined)[];
  version?: number;
  namespace?: string;
}

export interface IInfo {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  first_deployed?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  last_deployed?: string;
  deleted: string;
  description?: string;
  status?: TStatus;
  notes?: string;
}

export interface IChart {
  metadata?: IMetadata;
  lock?: ILock;
  templates: (IFile | undefined)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: { [key: string]: any };
  schema: string;
  files: (File | undefined)[];
}

export interface IMetadata {
  name?: string;
  home?: string;
  sources?: string[];
  version?: string;
  description?: string;
  keywords?: string[];
  maintainers?: (IMaintainer | undefined)[];
  icon?: string;
  apiVersion?: string;
  condition?: string;
  tags?: string;
  appVersion?: string;
  deprecated?: boolean;
  annotations?: { [key: string]: string };
  kubeVersion?: string;
  dependencies?: (IDependency | undefined)[];
  type?: string;
}

export interface IMaintainer {
  name?: string;
  email?: string;
  url?: string;
}

export interface ILock {
  generated: string;
  digest: string;
  dependencies: (IDependency | undefined)[];
}

export interface IDependency {
  name: string;
  version?: string;
  repository: string;
  condition?: string;
  tags?: string[];
  enabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
  'import-values'?: any[];
  alias?: string;
}

export interface IFile {
  name: string;
  data: string;
}

export interface IHook {
  name?: string;
  kind?: string;
  path?: string;
  manifest?: string;
  events?: THookEvent[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  last_run?: IHookExecution;
  weight?: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  delete_policies?: THookDeletePolicy[];
}

export interface IHookExecution {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  started_at?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  completed_at?: string;
  phase: THookPhase;
}

export type TStatus =
  | 'unknown'
  | 'deployed'
  | 'uninstalled'
  | 'superseded'
  | 'failed'
  | 'uninstalling'
  | 'pending-install'
  | 'pending-upgrade'
  | 'pending-rollback';

export type THookPhase = 'Unknown' | 'Running' | 'Succeeded' | 'Failed';

export type THookEvent =
  | 'pre-install'
  | 'post-install'
  | 'pre-delete'
  | 'post-delete'
  | 'pre-upgrade'
  | 'post-upgrade'
  | 'pre-rollback'
  | 'post-rollback'
  | 'test';

export type THookDeletePolicy = 'hook-succeeded' | 'hook-failed' | 'before-hook-creation';
