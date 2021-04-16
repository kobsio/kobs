import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IPluginPageProps } from 'utils/plugins';
import OpsgenieAlerts from 'plugins/opsgenie/OpsgenieAlerts';
import OpsgeniePageToolbar from 'plugins/opsgenie/OpsgeniePageToolbar';
import { getQueryFromSearch } from 'plugins/opsgenie/helpers';

// OpsgeniePageAlerts is the page to render a list of alerts. The user can enter an Opsgenie query in the toolbar, which
// is then used to get a list of alerts.
const OpsgeniePageAlerts: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [query, setQuery] = useState<string>(getQueryFromSearch(location.search));

  const changeQuery = (q: string): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${q}`,
    });
  };

  useEffect(() => {
    setQuery(getQueryFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {name}
        </Title>
        <p>{description}</p>
        <OpsgeniePageToolbar query={query} setQuery={changeQuery} />
      </PageSection>

      <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
        <OpsgenieAlerts name={name} query={query} />
      </PageSection>
    </React.Fragment>
  );
};

export default OpsgeniePageAlerts;
