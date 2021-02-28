import {
  Alert,
  AlertActionLink,
  AlertVariant,
  List,
  ListItem,
  ListVariant,
  PageSection,
  PageSectionVariants,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { Link, useHistory, useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { GetApplicationRequest, GetApplicationResponse } from 'generated/proto/clusters_pb';
import { Application } from 'generated/proto/application_pb';
import { ClustersPromiseClient } from 'generated/proto/clusters_grpc_web_pb';
import Metrics from 'components/applications/details/metrics/Metrics';
import Resources from 'components/applications/details/resources/Resources';
import Title from 'components/shared/Title';
import { apiURL } from 'utils/constants';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IApplicationsParams {
  cluster: string;
  namespace: string;
  name: string;
}

// Applications is the page component to show a single application. The application is determined by the provided page
// params. When the application could not be loaded an error is shown. If the application was successfully loaded, we
// show the same components as in the tabs from the Applications drawer.
const Applications: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IApplicationsParams>();
  const [application, setApplication] = useState<Application | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [activeTabKey, setActiveTabKey] = useState<string>('resources');
  const refResourcesContent = useRef<HTMLElement>(null);
  const refMetricsContent = useRef<HTMLElement>(null);

  const goToOverview = (): void => {
    history.push('/');
  };

  // fetchApplication is used to fetch the application from the gRPC API. This is done every time the page paramertes
  // change. When there is an error during the fetch, the user will see the error.
  const fetchApplication = useCallback(async () => {
    try {
      const getApplicationRequest = new GetApplicationRequest();
      getApplicationRequest.setCluster(params.cluster);
      getApplicationRequest.setNamespace(params.namespace);
      getApplicationRequest.setName(params.name);

      const getApplicationsResponse: GetApplicationResponse = await clustersService.getApplication(
        getApplicationRequest,
        null,
      );

      setError('');
      setApplication(getApplicationsResponse.getApplication());
    } catch (err) {
      setError(err.message);
    }
  }, [params.cluster, params.namespace, params.name]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (!application) {
    return null;
  }

  // If there is an error, we will show it to the user. The user then has the option to retry the failed API call or to
  // go to the overview page.
  if (error) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          isInline={false}
          title="Application was not found"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={fetchApplication}>Retry</AlertActionLink>
              <AlertActionLink onClick={goToOverview}>Overview</AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error}</p>
        </Alert>
      </PageSection>
    );
  }

  return (
    <React.Fragment>
      <PageSection className="kobsio-pagesection-tabs" variant={PageSectionVariants.light}>
        <Title
          title={application.getName()}
          subtitle={`${application.getNamespace()} (${application.getCluster()})`}
          size="xl"
        />
        <List variant={ListVariant.inline}>
          {application.getLinksList().map((link, index) => (
            <ListItem key={index}>
              <Link target="_blank" to={link.getLink}>
                {link.getTitle()}
              </Link>
            </ListItem>
          ))}
        </List>
        <Tabs
          className="pf-u-mt-md"
          mountOnEnter={true}
          isFilled={true}
          activeKey={activeTabKey}
          onSelect={(event, tabIndex): void => setActiveTabKey(tabIndex.toString())}
        >
          <Tab
            eventKey="resources"
            title={<TabTitleText>Resources</TabTitleText>}
            tabContentId="refResources"
            tabContentRef={refResourcesContent}
          />
          <Tab
            eventKey="metrics"
            title={<TabTitleText>Metrics</TabTitleText>}
            tabContentId="refMetrics"
            tabContentRef={refMetricsContent}
          />
        </Tabs>
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <TabContent eventKey="resources" id="refResources" ref={refResourcesContent} aria-label="Resources">
          <div>
            <Resources application={application} />
          </div>
        </TabContent>
        <TabContent eventKey="metrics" id="refMetrics" ref={refMetricsContent} aria-label="Metrics">
          {/* We have to check if the refMetricsContent is not null, because otherwise the Metrics component will be shown below the resources component. */}
          <div>{refMetricsContent.current ? <Metrics application={application} /> : null}</div>
        </TabContent>
      </PageSection>
    </React.Fragment>
  );
};

export default Applications;
