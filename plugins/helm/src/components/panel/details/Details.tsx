import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import yaml from 'js-yaml';

import { Editor, Title } from '@kobsio/plugin-core';
import DetailsTemplates from './DetailsTemplates';
import History from '../History';
import { IRelease } from '../../../utils/interfaces';
import { formatTimeWrapper } from '../../../utils/helpers';

interface IDetailsProps {
  name: string;
  cluster: string;
  namespace: string;
  release: string;
  version: number;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  name,
  cluster,
  namespace,
  release,
  version,
  close,
}: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  const { isError, isLoading, error, data, refetch } = useQuery<IRelease, Error>(
    ['helm/release', name, cluster, namespace, release, version],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/${name}/release?cluster=${cluster}&namespace=${namespace}&name=${release}&version=${version}`,
          {
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
            throw new Error('An unknown error occurred');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={release} subtitle={`${namespace} (${cluster})`} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get Helm release"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IRelease, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <Tabs
            activeKey={activeTab}
            onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
            className="pf-u-mt-md"
            isFilled={true}
            mountOnEnter={true}
          >
            <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
              <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                <Card isCompact={true}>
                  <CardBody>
                    <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
                      {data.name && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Name</DescriptionListTerm>
                          <DescriptionListDescription>{data.name}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.namespace && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Namespace</DescriptionListTerm>
                          <DescriptionListDescription>{data.namespace}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.cluster && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Cluster</DescriptionListTerm>
                          <DescriptionListDescription>{data.cluster}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.version && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Version</DescriptionListTerm>
                          <DescriptionListDescription>{data.version}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.info?.status && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Status</DescriptionListTerm>
                          <DescriptionListDescription>{data.info.status}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.info?.description && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Description</DescriptionListTerm>
                          <DescriptionListDescription>{data.info.description}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.info?.first_deployed && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>First Deployment</DescriptionListTerm>
                          <DescriptionListDescription>
                            {formatTimeWrapper(data.info.first_deployed)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.info?.last_deployed && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Last Deployment</DescriptionListTerm>
                          <DescriptionListDescription>
                            {formatTimeWrapper(data.info.last_deployed)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {data.info?.notes && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Notes</DescriptionListTerm>
                          <DescriptionListDescription style={{ whiteSpace: 'pre-wrap' }}>
                            {data.info.notes}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                    </DescriptionList>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="values" title={<TabTitleText>Values</TabTitleText>}>
              <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                <Card isCompact={true}>
                  <Editor value={yaml.dump(data.config)} mode="yaml" readOnly={true} />
                </Card>
              </div>
            </Tab>

            <Tab eventKey="history" title={<TabTitleText>History</TabTitleText>}>
              <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                <Card isCompact={true}>
                  <CardBody>
                    <History name={name} cluster={cluster} namespace={namespace} release={release} />
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="Templates" title={<TabTitleText>Templates</TabTitleText>}>
              <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                <Card isCompact={true}>
                  <DetailsTemplates release={data} />
                </Card>
              </div>
            </Tab>
          </Tabs>
        ) : null}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
