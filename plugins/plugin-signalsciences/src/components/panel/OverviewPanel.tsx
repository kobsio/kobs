import { Alert, AlertActionLink, AlertVariant, Badge, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { getFlag, roundNumber } from '../../utils/helpers';
import { IOverviewSite } from '../../utils/interfaces';

interface IRequestsPanelProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  times: ITimes;
}

const RequestsPanel: React.FunctionComponent<IRequestsPanelProps> = ({
  title,
  description,
  instance,
  times,
}: IRequestsPanelProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IOverviewSite[], Error>(
    ['signalsciences/overview', instance, times],
    async () => {
      const response = await fetch(
        `/api/plugins/signalsciences/overview?from=${times.timeStart}&until=${times.timeEnd}`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get overview"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IOverviewSite[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data?.length > 0 ? (
        <TableComposable aria-label="requests table" variant={TableVariant.compact} borders={true}>
          <Thead>
            <Tr>
              <Th>Site</Th>
              <Th>Requests with Attack Signals</Th>
              <Th>Attack Signals</Th>
              <Th>Countries</Th>
              <Th>Flagged IPs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((site) => (
              <Tr key={site.Name}>
                <Td dataLabel="Site">
                  <div className="pf-u-font-weight-bold">{site.DisplayName}</div>
                  <div>{site.TotalCount} requests</div>
                </Td>
                <Td dataLabel="Requests with Attack Signals">
                  <div>{site.BlockedCount} blocked</div>
                  <div>{site.AttackCount} attacked</div>
                </Td>
                <Td dataLabel="Attack Signals">
                  {site.TopAttackTypes.map((attack) => (
                    <div key={attack.TagName}>
                      {roundNumber((attack.TagCount * 100) / attack.TotalCount)}%
                      <Badge className="pf-u-ml-sm" style={{ backgroundColor: 'var(--pf-global--danger-color--100)' }}>
                        {attack.TagName}
                      </Badge>
                    </div>
                  ))}
                </Td>
                <Td dataLabel="Countries">
                  {site.TopAttackSources.map((source) => (
                    <div key={source.CountryCode}>
                      {getFlag(source.CountryCode)} {roundNumber((source.RequestCount * 100) / source.TotalCount)}%
                    </div>
                  ))}
                </Td>
                <Td dataLabel="Flagged IPs">{site.FlaggedIPCount}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      ) : (
        <Alert variant={AlertVariant.info} isInline={false} title="No requests found">
          <p>No requests were found for the provided query.</p>
        </Alert>
      )}
    </PluginPanel>
  );
};

export default RequestsPanel;
