import { Drawer, DrawerColorVariant, DrawerContent, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { IApplicationOptions, IFilters, IPluginOptions } from '../../utils/interfaces';
import ApplicationMetrics from './ApplicationMetrics';
import ApplicationTap from './ApplicationTap';
import ApplicationToolbar from './ApplicationToolbar';
import ApplicationTop from './ApplicationTop';
import { Title } from '@kobsio/plugin-core';
import { getApplicationOptionsFromSearch } from '../../utils/helpers';

interface IApplicationParams {
  namespace: string;
  application: string;
}

export interface IApplicationProps {
  name: string;
  pluginOptions: IPluginOptions;
}

const Application: React.FunctionComponent<IApplicationProps> = ({ name, pluginOptions }: IApplicationProps) => {
  const params = useParams<IApplicationParams>();
  const location = useLocation();
  const history = useHistory();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const [options, setOptions] = useState<IApplicationOptions>(getApplicationOptionsFromSearch(location.search));

  const changeOptions = (tmpOptions: IApplicationOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?timeEnd=${tmpOptions.times.timeEnd}&timeStart=${tmpOptions.times.timeStart}&view=${
        tmpOptions.view
      }&filterName=${encodeURIComponent(tmpOptions.filters.name)}&filterMethod=${encodeURIComponent(
        tmpOptions.filters.method,
      )}&filterPath=${encodeURIComponent(tmpOptions.filters.path)}`,
    });
  };

  const setFilters = (filters: IFilters): void => {
    history.push({
      pathname: location.pathname,
      search: `?timeEnd=${options.times.timeEnd}&timeStart=${options.times.timeStart}&view=${
        options.view
      }&filterName=${encodeURIComponent(filters.name)}&filterMethod=${encodeURIComponent(
        filters.method,
      )}&filterPath=${encodeURIComponent(filters.path)}`,
    });
  };

  useEffect(() => {
    setOptions(getApplicationOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={params.application} subtitle={params.namespace} size="xl" />
        <ApplicationToolbar
          view={options.view}
          times={options.times}
          filters={options.filters}
          setOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details} colorVariant={DrawerColorVariant.light200}>
          {options.view === 'metrics' ? (
            <ApplicationMetrics
              name={name}
              namespace={params.namespace}
              application={params.application}
              times={options.times}
              filters={options.filters}
              view={options.view}
              pluginOptions={pluginOptions}
              setDetails={setDetails}
            />
          ) : options.view === 'top' ? (
            <ApplicationTop
              name={name}
              namespace={params.namespace}
              application={params.application}
              times={options.times}
              filters={options.filters}
              view={options.view}
              pluginOptions={pluginOptions}
              setFilters={setFilters}
              setDetails={setDetails}
            />
          ) : options.view === 'tap' ? (
            <ApplicationTap
              name={name}
              namespace={params.namespace}
              application={params.application}
              times={options.times}
              filters={options.filters}
              view={options.view}
              pluginOptions={pluginOptions}
              setFilters={setFilters}
              setDetails={setDetails}
            />
          ) : null}
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Application;
