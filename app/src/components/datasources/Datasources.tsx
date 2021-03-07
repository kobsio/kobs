import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Gallery,
  GalleryItem,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { GetDatasourcesRequest, GetDatasourcesResponse } from 'generated/proto/datasources_pb';
import { Datasource } from 'generated/proto/datasources_pb';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import Item from 'components/datasources/Item';
import { apiURL } from 'utils/constants';
import { datasourcesDescription } from 'utils/constants';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

// Datasources renders a gallery with all configured datasources. A click on the card of a datasource redirects the user
// to the page for this datasource.
const Datasources: React.FunctionComponent = () => {
  const history = useHistory();
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [error, setError] = useState<string>('');

  // In case of an error the user can retry the API call or he can go back to the overview page.
  const goToOverview = (): void => {
    history.push('/');
  };

  // fetchDatasources fetches all datasources from the gRPC API. When an error occurs during the API call, the user will
  // see the error and he can retry the call.
  const fetchDatasources = useCallback(async () => {
    try {
      const getDatasourcesRequest = new GetDatasourcesRequest();

      const getDatasourcesResponse: GetDatasourcesResponse = await datasourcesService.getDatasources(
        getDatasourcesRequest,
        null,
      );

      setError('');
      setDatasources(getDatasourcesResponse.getDatasourcesList());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchDatasources();
  }, [fetchDatasources]);

  // If there is an error, we will show it to the user. The user then has the option to retry the failed API call or to
  // go to the overview page.
  if (error) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          isInline={false}
          title="Could not load datasources"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={fetchDatasources}>Retry</AlertActionLink>
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
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Datasources
        </Title>
        <p>{datasourcesDescription}</p>
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Gallery hasGutter={true}>
          {datasources.map((datasource, index) => (
            <GalleryItem key={index}>
              <Item
                name={datasource.getName()}
                type={datasource.getType()}
                link={`/datasources/${datasource.getType()}/${datasource.getName()}`}
              />
            </GalleryItem>
          ))}
        </Gallery>
      </PageSection>
    </React.Fragment>
  );
};

export default Datasources;
