import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IPluginPageProps } from '@kobsio/plugin-core';
import PageSQL from './PageSQL';
import PageToolbar from './PageToolbar';
import { getQueryFromSearch } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [query, setQuery] = useState<string>(getQueryFromSearch(location.search));

  // changeOptions is used to change the options for an ClickHouse query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (q: string): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${q}`,
    });
  };

  // useEffect is used to set the options every time the search location for the current URL changes. The URL is changed
  // via the changeOptions function. When the search location is changed we modify the options state.
  useEffect(() => {
    setQuery(getQueryFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar query={query} setQuery={changeOptions} />
      </PageSection>

      <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
        {query.length > 0 && <PageSQL name={name} query={query} />}
      </PageSection>
    </React.Fragment>
  );
};

export default Page;
