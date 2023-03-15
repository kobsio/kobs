export const description = 'The package manager for Kubernetes.';

export interface IRelease {
  chart?: IChart;
  cluster?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: { [key: string]: any };
  hooks?: (IHook | undefined)[];
  info?: IInfo;
  manifest?: string;
  name?: string;
  namespace?: string;
  version?: number;
}

export interface IInfo {
  deleted?: string;
  description?: string;
  first_deployed?: string;
  last_deployed?: string;
  notes?: string;
  status?: TStatus;
}

export interface IChart {
  files: (IFile | undefined)[];
  lock?: ILock | null;
  metadata?: IMetadata;
  schema?: string | null;
  templates: (IFile | undefined)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: { [key: string]: any };
}

export interface IMetadata {
  annotations?: { [key: string]: string };
  apiVersion?: string;
  appVersion?: string;
  condition?: string;
  dependencies?: (IDependency | undefined)[];
  deprecated?: boolean;
  description?: string;
  home?: string;
  icon?: string;
  keywords?: string[];
  kubeVersion?: string;
  maintainers?: (IMaintainer | undefined)[];
  name?: string;
  sources?: string[];
  tags?: string;
  type?: string;
  version?: string;
}

export interface IMaintainer {
  email?: string;
  name?: string;
  url?: string;
}

export interface ILock {
  dependencies: (IDependency | undefined)[];
  digest: string;
  generated: string;
}

export interface IDependency {
  alias?: string;
  condition?: string;
  enabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'import-values'?: any[];
  name: string;
  repository: string;
  tags?: string[];
  version?: string;
}

export interface IFile {
  data: string;
  name: string;
}

export interface IHook {
  delete_policies?: THookDeletePolicy[];
  events?: THookEvent[];
  kind?: string;
  last_run?: IHookExecution;
  manifest?: string;
  name?: string;
  path?: string;
  weight?: number;
}

export interface IHookExecution {
  completed_at?: string;
  phase: THookPhase;
  started_at?: string;
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
