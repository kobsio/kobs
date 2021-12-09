import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageChart from './PageChartWrapper';
import PageToolbar from './PageToolbar';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(useMemo<IOptions>(() => getInitialOptions(), []));

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const queries = opts.queries ? opts.queries.map((query) => `&query=${query}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}&resolution=${
        opts.resolution
      }${queries.length > 0 ? queries.join('') : ''}`,
    });

    setOptions(opts);
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar name={name} options={options} setOptions={changeOptions} />
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        {options.queries.length > 0 && options.queries[0] !== '' ? (
          <PageChart name={name} queries={options.queries} resolution={options.resolution} times={options.times} />
        ) : null}
      </PageSection>
    </React.Fragment>
  );
};

export default Page;
