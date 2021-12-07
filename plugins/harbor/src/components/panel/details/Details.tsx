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
  Tab,
  TabTitleText,
  Tabs,
  Tooltip,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CopyIcon } from '@patternfly/react-icons';

import BuildHistory from './BuildHistory';
import { IArtifact } from '../../../utils/interfaces';
import Overview from './Overview';
import Reference from './Reference';
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
  const [activeTab, setActiveTab] = useState<string>(
    artifact.references && artifact.references.length > 0 ? artifact.references[0].child_digest : '',
  );

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

        {artifact.references && artifact.references.length > 0 ? (
          <Tabs
            activeKey={activeTab}
            onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
            className="pf-u-mt-md"
            isFilled={true}
            mountOnEnter={true}
          >
            {artifact.references.map((reference) => (
              <Tab
                key={reference.child_digest}
                eventKey={reference.child_digest}
                title={
                  <TabTitleText>
                    {reference.child_digest.substring(0, 15)} ({reference.platform.os}/{reference.platform.architecture}
                    )
                  </TabTitleText>
                }
              >
                <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                  <Reference
                    name={name}
                    projectName={projectName}
                    repositoryName={repositoryName}
                    artifactReference={reference.child_digest}
                  />
                </div>
              </Tab>
            ))}
          </Tabs>
        ) : (
          <div>
            {artifact.extra_attrs && (
              <div>
                <Overview artifact={artifact} />
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
          </div>
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
