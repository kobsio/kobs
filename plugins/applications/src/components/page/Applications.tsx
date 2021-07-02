import {
  Alert,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import ApplicationsToolbar from './ApplicationsToolbar';
import Panel from '../panel/Panel';
import { TView } from '../../utils/interfaces';

interface IDataState {
  clusters: string[];
  namespaces: string[];
  view: TView;
}

// getDataFromSearch returns the clusters and namespaces for the state from a given search location.
export const getDataFromSearch = (search: string): IDataState => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');
  const view = params.get('view');

  return {
    clusters: clusters,
    namespaces: namespaces,
    view: view ? (view as TView) : 'gallery',
  };
};

export interface IApplicationsProps {
  name: string;
  displayName: string;
  description: string;
}

// Applications is the page which lets the user query all the created applications by cluster and namespace. The user
// can also select the view he wants to see (gallery vs. topology). The component is just a wrapper for the toolbar and
// the panel. It handles the reflection of the selected clusters and namespaces in the current url.
const Applications: React.FunctionComponent<IApplicationsProps> = ({
  name,
  displayName,
  description,
}: IApplicationsProps) => {
  const history = useHistory();
  const location = useLocation();
  const [data, setData] = useState<IDataState>(getDataFromSearch(location.search));
  const [selectedApplication, setSelectedApplication] = useState<React.ReactNode>(undefined);

  // changeData is used to set the provided list of clusters and namespaces as query parameters for the current URL, so
  // that a user can share his search with other users.
  const changeData = (clusters: string[], namespaces: string[], view: string): void => {
    const c = clusters.map((cluster) => `&cluster=${cluster}`);
    const n = namespaces.map((namespace) => `&namespace=${namespace}`);

    history.push({
      pathname: location.pathname,
      search: `?view=${view}${c.length > 0 ? c.join('') : ''}${n.length > 0 ? n.join('') : ''}`,
    });
  };

  // useEffect is used to change the data state everytime the location.search parameter changes.
  useEffect(() => {
    setData(getDataFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <ApplicationsToolbar
          clusters={data.clusters}
          namespaces={data.namespaces}
          view={data.view}
          changeData={changeData}
        />
      </PageSection>

      <Drawer isExpanded={selectedApplication !== undefined}>
        <DrawerContent panelContent={selectedApplication}>
          <DrawerContentBody>
            <PageSection
              style={data.view === 'topology' ? { height: '100%', minHeight: '100%' } : { minHeight: '100%' }}
              variant={PageSectionVariants.default}
            >
              {data.clusters.length === 0 || data.namespaces.length === 0 ? (
                <Alert variant={AlertVariant.info} title="Select clusters and namespaces">
                  <p>Select a list of clusters and namespaces from the toolbar.</p>
                </Alert>
              ) : (
                <Panel
                  defaults={{ cluster: '', name: '', namespace: '' }}
                  name={name}
                  title=""
                  options={{
                    clusters: data.clusters,
                    namespaces: data.namespaces,
                    team: undefined,
                    view: data.view,
                  }}
                  showDetails={setSelectedApplication}
                />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Applications;
