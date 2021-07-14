import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageChart from './PageChartWrapper';
import PageToolbar from './PageToolbar';
import { getOptionsFromSearch } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(getOptionsFromSearch(location.search));

  // changeOptions is used to change the options for an Prometheus query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    const queries = opts.queries ? opts.queries.map((query) => `&query=${query}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?resolution=${opts.resolution}&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${
        opts.times.timeStart
      }${queries.length > 0 ? queries.join('') : ''}`,
    });
  };

  // useEffect is used to set the options every time the search location for the current URL changes. The URL is changed
  // via the changeOptions function. When the search location is changed we modify the options state.
  useEffect(() => {
    setOptions(getOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar
          name={name}
          queries={options.queries}
          resolution={options.resolution}
          times={options.times}
          setOptions={changeOptions}
        />
      </PageSection>

      <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
        {options.queries.length > 0 && options.queries[0] !== '' ? (
          <PageChart name={name} queries={options.queries} resolution={options.resolution} times={options.times} />
        ) : null}
      </PageSection>
    </React.Fragment>
  );
};

export default Page;
