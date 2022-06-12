import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import React from 'react';

import { formatBytes, formatTime } from '../../../utils/helpers';
import { IArtifact } from '../../../utils/interfaces';

interface IOverviewProps {
  artifact: IArtifact;
}

const Overview: React.FunctionComponent<IOverviewProps> = ({ artifact }: IOverviewProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>Overview</CardTitle>
      <CardBody>
        <TableComposable aria-label="Details" variant={TableVariant.compact} borders={false}>
          <Tbody>
            {artifact.extra_attrs.created && (
              <Tr key="created">
                <Td>Created</Td>
                <Td>{formatTime(artifact.extra_attrs.created)}</Td>
              </Tr>
            )}
            {artifact.size && (
              <Tr key="size">
                <Td>Size</Td>
                <Td>{formatBytes(artifact.size)}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.author && (
              <Tr key="author">
                <Td>Author</Td>
                <Td>{artifact.extra_attrs.author}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.architecture && (
              <Tr key="architecture">
                <Td>Architecture</Td>
                <Td>{artifact.extra_attrs.architecture}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.os && (
              <Tr key="os">
                <Td>OS</Td>
                <Td>{artifact.extra_attrs.os}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.Cmd && (
              <Tr key="cmd">
                <Td>Cmd</Td>
                <Td style={{ whiteSpace: 'pre-wrap' }}>{artifact.extra_attrs.config.Cmd.join('\n')}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.Entrypoint && (
              <Tr key="entrypoint">
                <Td>Entrypoint</Td>
                <Td style={{ whiteSpace: 'pre-wrap' }}>{artifact.extra_attrs.config.Entrypoint.join('\n')}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.Env && (
              <Tr key="env">
                <Td>Env</Td>
                <Td style={{ whiteSpace: 'pre-wrap' }}>{artifact.extra_attrs.config.Env.join('\n')}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.ExposedPorts && (
              <Tr key="ports">
                <Td>Ports</Td>
                <Td style={{ whiteSpace: 'pre-wrap' }}>
                  {Object.keys(artifact.extra_attrs.config.ExposedPorts).join('\n')}
                </Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.Labels && (
              <Tr key="labels">
                <Td>Labels</Td>
                <Td style={{ whiteSpace: 'pre-wrap' }}>
                  {Object.keys(artifact.extra_attrs.config.Labels)
                    .map(
                      (key) =>
                        `${key}=${artifact.extra_attrs.config.Labels && artifact.extra_attrs.config.Labels[key]}`,
                    )
                    .join('\n')}
                </Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.User && (
              <Tr key="user">
                <Td>User</Td>
                <Td>{artifact.extra_attrs.config.User}</Td>
              </Tr>
            )}
            {artifact.extra_attrs.config.WorkingDir && (
              <Tr key="workingdir">
                <Td>Workind Dir</Td>
                <Td>{artifact.extra_attrs.config.WorkingDir}</Td>
              </Tr>
            )}
          </Tbody>
        </TableComposable>
      </CardBody>
    </Card>
  );
};

export default Overview;
