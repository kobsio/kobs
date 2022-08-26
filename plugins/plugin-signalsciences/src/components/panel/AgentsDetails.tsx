import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { IAgent } from '../../utils/interfaces';

interface IAgentsDetailsProps {
  agent: IAgent;
  close: () => void;
}

const AgentsDetails: React.FunctionComponent<IAgentsDetailsProps> = ({ agent, close }: IAgentsDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {agent['agent.name']}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <DescriptionList className="pf-u-text-break-word">
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.active</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.active']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.addr</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.addr']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.args</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.args']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.build_id</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.build_id']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.cgroup</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.cgroup']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.connections_dropped</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.connections_dropped']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.connections_open</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.connections_open']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.connections_total</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.connections_total']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.current_requests</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.current_requests']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.decision_time_50th</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.decision_time_50th']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.decision_time_95th</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.decision_time_95th']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.decision_time_99th</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.decision_time_99th']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.enabled</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.enabled']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.last_rule_update</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.last_rule_update']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.last_seen</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.last_seen']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.latency_time_50th</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.latency_time_50th']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.latency_time_95th</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.latency_time_95th']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.latency_time_99th</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.latency_time_99th']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.max_procs</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.max_procs']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.name</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.name']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.pid</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.pid']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.read_bytes</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.read_bytes']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.rpc_postrequest</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.rpc_postrequest']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.rpc_prerequest</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.rpc_prerequest']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.rpc_updaterequest</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.rpc_updaterequest']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.rule_updates</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.rule_updates']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.status</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.status']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.timestamp</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.timestamp']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.timezone</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.timezone']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.timezone_offset</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.timezone_offset']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.upload_metadata_failures</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.upload_metadata_failures']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.upload_size</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.upload_size']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.uptime</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.uptime']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.version</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.version']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.versions_behind</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.versions_behind']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">agent.write_bytes</DescriptionListTerm>
            <DescriptionListDescription>{agent['agent.write_bytes']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.agent_cpu</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.agent_cpu']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.architecture</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.architecture']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.clock_skew</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.clock_skew']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.cpu</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.cpu']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.cpu_mhz</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.cpu_mhz']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.instance_type</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.instance_type']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.num_cpu</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.num_cpu']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.os</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.os']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">host.remote_addr</DescriptionListTerm>
            <DescriptionListDescription>{agent['host.remote_addr']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">module.detected</DescriptionListTerm>
            <DescriptionListDescription>{agent['module.detected']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">module.server</DescriptionListTerm>
            <DescriptionListDescription>{agent['module.server']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">module.type</DescriptionListTerm>
            <DescriptionListDescription>{agent['module.type']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">module.version</DescriptionListTerm>
            <DescriptionListDescription>{agent['module.version']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">module.versions_behind</DescriptionListTerm>
            <DescriptionListDescription>{agent['module.versions_behind']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">runtime.gc_pause_millis</DescriptionListTerm>
            <DescriptionListDescription>{agent['runtime.gc_pause_millis']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">mem_size</DescriptionListTerm>
            <DescriptionListDescription>{agent['mem_size']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">num_gc</DescriptionListTerm>
            <DescriptionListDescription>{agent['num_gc']}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm className="pf-u-text-nowrap">num_goroutines</DescriptionListTerm>
            <DescriptionListDescription>{agent['num_goroutines']}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default AgentsDetails;
