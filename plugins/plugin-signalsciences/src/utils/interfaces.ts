import { ITimes } from '@kobsio/shared';

export interface IRequestsOptions {
  query: string;
  page: number;
  perPage: number;
  siteName: string;
  times: ITimes;
}

export interface IAgentsOptions {
  siteName: string;
  times: ITimes;
}

export interface IPanelOptions {
  type?: string;
  siteName?: string;
  query?: string;
}

export interface ISite {
  Name: string;
  DisplayName: string;
  AgentLevel: string;
  BlockHTTPCode: number;
  BlockDurationSeconds: number;
  Created: string;
  Whitelist: Record<string, string>;
  Blacklist: Record<string, string>;
  Events: Record<string, string>;
  Requests: Record<string, string>;
  Redactions: Record<string, string>;
  SuspiciousIPs: Record<string, string>;
  Monitors: Record<string, string>;
  Pathwhitelist: Record<string, string>;
  Paramwhitelist: Record<string, string>;
  Integrations: Record<string, string>;
  HeaderLinks: Record<string, string>;
  Agents: Record<string, string>;
  Alerts: Record<string, string>;
  AnalyticsEvents: Record<string, string>;
  TopAttacks: Record<string, string>;
  Members: Record<string, string>;
  AgentAnonMode: string;
}

export interface IRequest {
  ID: string;
  ServerHostname: string;
  RemoteIP: string;
  RemoteHostname: string;
  RemoteCountryCode: string;
  UserAgent: string;
  Timestamp: string;
  Method: string;
  ServerName: string;
  Protocol: string;
  Path: string;
  URI: string;
  ResponseCode: number;
  ResponseSize: number;
  ResponseMillis: number;
  AgentResponseCode: number;
  Tags: IRequestTag[];
}

export interface IRequestTag {
  Type: string;
  Location: string;
  Value: string;
  Detector: string;
}

export interface ITopAttackType {
  TagName: string;
  TagCount: number;
  TotalCount: number;
}

export interface ITopAttackSource {
  CountryCode: string;
  CountryName: string;
  RequestCount: number;
  TotalCount: number;
}

export interface IOverviewSite {
  Name: string;
  DisplayName: string;
  TotalCount: number;
  BlockedCount: number;
  FlaggedCount: number;
  AttackCount: number;
  FlaggedIPCount: number;
  TopAttackTypes: ITopAttackType[];
  TopAttackSources: ITopAttackSource[];
}

export interface IAgent {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.active': boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.addr': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.args': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.build_id': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.cgroup': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.connections_dropped': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.connections_open': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.connections_total': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.current_requests': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.decision_time_50th': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.decision_time_95th': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.decision_time_99th': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.enabled': boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.last_rule_update': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.last_seen': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.latency_time_50th': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.latency_time_95th': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.latency_time_99th': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.max_procs': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.name': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.pid': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.read_bytes': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.rpc_postrequest': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.rpc_prerequest': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.rpc_updaterequest': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.rule_updates': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.status': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.timestamp': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.timezone': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.timezone_offset': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.upload_metadata_failures': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.upload_size': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.uptime': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.version': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.versions_behind': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'agent.write_bytes': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.agent_cpu': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.architecture': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.clock_skew': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.cpu': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.cpu_mhz': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.instance_type': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.num_cpu': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.os': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'host.remote_addr': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'module.detected': boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'module.server': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'module.type': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'module.version': string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'module.versions_behind': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'runtime.gc_pause_millis': number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  mem_size: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  num_gc: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  num_goroutines: number;
}
