import {
  Button,
  Card,
  CardBody,
  CardTitle,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tooltip,
} from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CopyIcon } from '@patternfly/react-icons';
import React from 'react';

import BuildHistory from './BuildHistory';
import { IArtifact } from '../../../utils/interfaces';
import { Title } from '@kobsio/plugin-core';
import Vulnerabilities from './Vulnerabilities';
import { formatTime } from '../../../utils/helpers';

interface IDetailsProps {
  name: string;
  address: string;
  projectName: string;
  repositoryName: string;
  artifact: IArtifact;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  name,
  address,
  projectName,
  repositoryName,
  artifact,
  close,
}: IDetailsProps) => {
  const copyPullCommand = (tag: string): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `docker pull ${address.replace('http://', '').replace('https://', '')}/${projectName}/${decodeURIComponent(
          repositoryName,
        )}:${tag}`,
      );
    }
  };

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={`${projectName}/${decodeURIComponent(repositoryName)}`}
          subtitle={artifact.tags ? artifact.tags.map((tag) => tag.name).join(', ') : artifact.digest}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {artifact.tags && (
          <div>
            <Card isCompact={true}>
              <CardTitle>Tags</CardTitle>
              <CardBody>
                <TableComposable aria-label="Details" variant={TableVariant.compact} borders={false}>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Push Time</Th>
                      <Th>Pull Time</Th>
                      <Th />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {artifact.tags.map((tag) => (
                      <Tr key={tag.id}>
                        <Td>{tag.name}</Td>
                        <Td>{formatTime(tag.push_time)}</Td>
                        <Td>{formatTime(tag.pull_time)}</Td>
                        <Td noPadding={true} style={{ padding: 0 }}>
                          <Tooltip content={<div>Copy Pull Command</div>}>
                            <Button variant="plain" aria-label="Copy" onClick={(): void => copyPullCommand(tag.name)}>
                              <CopyIcon />
                            </Button>
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </TableComposable>
              </CardBody>
            </Card>
            <p>&nbsp;</p>
          </div>
        )}

        {artifact.extra_attrs && (
          <div>
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
                                `${key}=${
                                  artifact.extra_attrs.config.Labels && artifact.extra_attrs.config.Labels[key]
                                }`,
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
            <p>&nbsp;</p>
          </div>
        )}

        <BuildHistory
          name={name}
          projectName={projectName}
          repositoryName={repositoryName}
          artifactReference={artifact.digest}
        />
        <p>&nbsp;</p>

        <Vulnerabilities
          name={name}
          projectName={projectName}
          repositoryName={repositoryName}
          artifactReference={artifact.digest}
        />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
