import {
  Alert,
  AlertActionLink,
  AlertVariant,
  List,
  ListItem,
  ListVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ClustersPromiseClient, GetApplicationRequest, GetApplicationResponse } from 'proto/clusters_grpc_web_pb';
import ApplicationTabs from 'components/applications/ApplicationTabs';
import ApplicationTabsContent from 'components/applications/ApplicationTabsContent';
import { Application as IApplication } from 'proto/application_pb';
import Title from 'components/Title';
import { apiURL } from 'utils/constants';

interface IDataState {
  application?: IApplication.AsObject;
  error: string;
  isLoading: boolean;
}

interface IApplicationsParams {
  cluster: string;
  namespace: string;
  name: string;
}
// clustersService is the Clusters gRPC service, which is used to get an application.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

const Application: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IApplicationsParams>();
  const [data, setData] = useState<IDataState>({ application: undefined, error: '', isLoading: true });

  const [activeTab, setActiveTab] = useState<string>('resources');
  const refResourcesContent = useRef<HTMLElement>(null);

  const fetchApplication = useCallback(async () => {
    try {
      setData({ application: undefined, error: '', isLoading: true });

      const getApplicationRequest = new GetApplicationRequest();
      getApplicationRequest.setCluster(params.cluster);
      getApplicationRequest.setNamespace(params.namespace);
      getApplicationRequest.setName(params.name);

      const getApplicationResponse: GetApplicationResponse = await clustersService.getApplication(
        getApplicationRequest,
        null,
      );

      setData({ application: getApplicationResponse.toObject().application, error: '', isLoading: false });
    } catch (err) {
      setData({ application: undefined, error: err.message, isLoading: false });
    }
  }, [params.cluster, params.namespace, params.name]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (data.isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (data.error || !data.application) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get application"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={fetchApplication}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error ? data.error : 'Application is undefined'}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      <PageSection style={{ paddingBottom: '0px' }} variant={PageSectionVariants.light}>
        <Title
          title={data.application.name}
          subtitle={`${data.application.namespace} (${data.application.cluster})`}
          size="xl"
        />
        {data.application.details ? (
          <div>
            <p>{data.application.details.description}</p>
            <List variant={ListVariant.inline}>
              {data.application.details.linksList.map((link, index) => (
                <ListItem key={index}>
                  <a href={link.link} rel="noreferrer" target="_blank">
                    {link.title}
                  </a>
                </ListItem>
              ))}
            </List>
          </div>
        ) : null}
        <ApplicationTabs activeTab={activeTab} setTab={setActiveTab} refResourcesContent={refResourcesContent} />
      </PageSection>

      <ApplicationTabsContent
        application={data.application}
        activeTab={activeTab}
        isInDrawer={false}
        refResourcesContent={refResourcesContent}
      />
    </React.Fragment>
  );
};

export default Application;
