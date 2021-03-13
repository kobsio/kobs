import { Alert, AlertActionLink, AlertVariant, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';

import Elasticsearch from 'components/datasources/elasticsearch/Elasticsearch';
import Prometheus from 'components/datasources/prometheus/Prometheus';

interface IDatasourceParams {
  type: string;
  name: string;
}

// Datasource is the component, which checks the provided type from the URL and renders the corresponding component for
// the datasource type.
const Datasource: React.FunctionComponent = () => {
  const params = useParams<IDatasourceParams>();
  const history = useHistory();

  const goToDatasources = (): void => {
    history.push('/');
  };

  if (params.type === 'prometheus') {
    return <Prometheus name={params.name} />;
  }

  if (params.type === 'elasticsearch') {
    return <Elasticsearch name={params.name} />;
  }

  // When the provided datasource type, isn't valid, the user will see the following error, with an action to go back to
  // the datasource page.
  return (
    <PageSection variant={PageSectionVariants.default}>
      <Alert
        variant={AlertVariant.danger}
        isInline={false}
        title="Invalid datasource type"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={goToDatasources}>Datasources</AlertActionLink>
          </React.Fragment>
        }
      />
    </PageSection>
  );
};

export default Datasource;
