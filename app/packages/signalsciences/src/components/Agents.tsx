import {
  APIContext,
  APIError,
  IAPIContext,
  ITimes,
  UseQueryWrapper,
  roundNumber,
  IPluginInstance,
  formatTimeString,
  DetailsDrawer,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@kobsio/core';
import {
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

interface IAgent {
  'agent.active': boolean;
  'agent.addr': string;
  'agent.args': string;
  'agent.build_id': string;
  'agent.cgroup': string;
  'agent.connections_dropped': number;
  'agent.connections_open': number;
  'agent.connections_total': number;
  'agent.current_requests': number;
  'agent.decision_time_50th': number;
  'agent.decision_time_95th': number;
  'agent.decision_time_99th': number;
  'agent.enabled': boolean;
  'agent.last_rule_update': string;
  'agent.last_seen': string;
  'agent.latency_time_50th': number;
  'agent.latency_time_95th': number;
  'agent.latency_time_99th': number;
  'agent.max_procs': number;
  'agent.name': string;
  'agent.pid': number;
  'agent.read_bytes': number;
  'agent.rpc_postrequest': number;
  'agent.rpc_prerequest': number;
  'agent.rpc_updaterequest': number;
  'agent.rule_updates': number;
  'agent.status': string;
  'agent.timestamp': number;
  'agent.timezone': string;
  'agent.timezone_offset': number;
  'agent.upload_metadata_failures': number;
  'agent.upload_size': number;
  'agent.uptime': number;
  'agent.version': string;
  'agent.versions_behind': number;
  'agent.write_bytes': number;
  'host.agent_cpu': number;
  'host.architecture': string;
  'host.clock_skew': number;
  'host.cpu': number;
  'host.cpu_mhz': number;
  'host.instance_type': string;
  'host.num_cpu': number;
  'host.os': string;
  'host.remote_addr': string;
  mem_size: number;
  'module.detected': boolean;
  'module.server': string;
  'module.type': string;
  'module.version': string;
  'module.versions_behind': number;
  num_gc: number;
  num_goroutines: number;
  'runtime.gc_pause_millis': number;
}

const Details: FunctionComponent<{
  agent: IAgent;
  onClose: () => void;
  open: boolean;
}> = ({ agent, onClose, open }) => {
  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={agent['agent.name']}
      subtitle={agent['host.remote_addr']}
    >
      <Card>
        <CardContent>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.active</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.active'] ? 'True' : 'False'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.addr</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.addr']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.args</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.args']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.build_id</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.build_id']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.cgroup</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.cgroup']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.connections_dropped</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.connections_dropped']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.connections_open</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.connections_open']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.connections_total</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.connections_total']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.current_requests</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.current_requests']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.decision_time_50th</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.decision_time_50th']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.decision_time_95th</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.decision_time_95th']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.decision_time_99th</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.decision_time_99th']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.enabled</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.enabled'] ? 'True' : 'False'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.last_rule_update</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.last_rule_update']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.last_seen</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.last_seen']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.latency_time_50th</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.latency_time_50th']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.latency_time_95th</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.latency_time_95th']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.latency_time_99th</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.latency_time_99th']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.max_procs</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.max_procs']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.name</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.name']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.pid</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.pid']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.read_bytes</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.read_bytes']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.rpc_postrequest</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.rpc_postrequest']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.rpc_prerequest</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.rpc_prerequest']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.rpc_updaterequest</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.rpc_updaterequest']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.rule_updates</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.rule_updates']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.status</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.status']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.timestamp</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.timestamp']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.timezone</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.timezone']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.timezone_offset</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.timezone_offset']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.upload_metadata_failures</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.upload_metadata_failures']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.upload_size</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.upload_size']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.uptime</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.uptime']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.version</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.version']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.versions_behind</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.versions_behind']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>agent.write_bytes</DescriptionListTerm>
              <DescriptionListDescription>{agent['agent.write_bytes']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.agent_cpu</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.agent_cpu']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.architecture</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.architecture']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.clock_skew</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.clock_skew']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.cpu</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.cpu']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.cpu_mhz</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.cpu_mhz']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.instance_type</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.instance_type']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.num_cpu</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.num_cpu']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.os</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.os']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>host.remote_addr</DescriptionListTerm>
              <DescriptionListDescription>{agent['host.remote_addr']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>module.detected</DescriptionListTerm>
              <DescriptionListDescription>{agent['module.detected'] ? 'True' : 'False'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>module.server</DescriptionListTerm>
              <DescriptionListDescription>{agent['module.server']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>module.type</DescriptionListTerm>
              <DescriptionListDescription>{agent['module.type']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>module.version</DescriptionListTerm>
              <DescriptionListDescription>{agent['module.version']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>module.versions_behind</DescriptionListTerm>
              <DescriptionListDescription>{agent['module.versions_behind']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>runtime.gc_pause_millis</DescriptionListTerm>
              <DescriptionListDescription>{agent['runtime.gc_pause_millis']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>mem_size</DescriptionListTerm>
              <DescriptionListDescription>{agent['mem_size']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>num_gc</DescriptionListTerm>
              <DescriptionListDescription>{agent['num_gc']}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>num_goroutines</DescriptionListTerm>
              <DescriptionListDescription>{agent['num_goroutines']}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardContent>
      </Card>
    </DetailsDrawer>
  );
};

const Agent: FunctionComponent<{ agent: IAgent }> = ({ agent }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow
        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
        hover={true}
        selected={open}
        onClick={() => setOpen(true)}
      >
        <TableCell sx={{ verticalAlign: 'top' }}>
          <div>
            <Typography fontWeight="bold"> {agent['agent.name']}</Typography>
          </div>
          <div>{agent['host.remote_addr']}</div>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          <div>
            {agent['agent.status'] === 'online' ? (
              <Chip sx={{ mb: 1 }} size="small" color="success" label={agent['agent.status']} />
            ) : (
              <Chip sx={{ mb: 1 }} size="small" color="error" label={agent['agent.status']} />
            )}
          </div>
          <div>{formatTimeString(agent['agent.last_seen'])}</div>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>
          {agent['agent.version']}
          <Typography component="span" fontWeight="bold" sx={{ ml: 2 }}>
            {agent['agent.versions_behind'] > 0 ? '(Outdated)' : ''}
          </Typography>
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>{roundNumber(agent['agent.latency_time_50th'])}ms</TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>{roundNumber(agent['agent.latency_time_95th'])}ms</TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>{roundNumber(agent['agent.latency_time_99th'])}ms</TableCell>
      </TableRow>

      <Details agent={agent} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const Agents: FunctionComponent<{ instance: IPluginInstance; site: string; times: ITimes }> = ({
  instance,
  times,
  site,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IAgent[], APIError>(
    ['signalsciences/agents', instance, times, site],
    async () => {
      return apiContext.client.get<IAgent[]>(
        `/api/plugins/signalsciences/agents?siteName=${encodeURIComponent(site)}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load agents"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No agents were found"
      refetch={refetch}
    >
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>P50</TableCell>
                <TableCell>P95</TableCell>
                <TableCell>P99</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((agent) => (
                <Agent key={Agent.name} agent={agent} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </UseQueryWrapper>
  );
};

export default Agents;
