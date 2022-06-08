import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { defaultDescription } from '@kobsio/plugin-harbor/src/utils/constants';
import { getInitialApplicationOptions } from '../../utils/helpers';

import { IApplicationOptions, IFilters } from '../../utils/interfaces';
import ApplicationMetrics from './ApplicationMetrics';
import ApplicationTap from './ApplicationTap';
import ApplicationToolbar from './ApplicationToolbar';
import ApplicationTop from './ApplicationTop';

interface IApplicationParams extends Record<string, string | undefined> {
  namespace: string;
  application: string;
}

export interface IApplicationProps {
  instance: IPluginInstance;
}

const Application: React.FunctionComponent<IApplicationProps> = ({ instance }: IApplicationProps) => {
  const params = useParams<IApplicationParams>();
  const location = useLocation();
  const navigate = useNavigate();
  const [details, setDetails] = useState<React.ReactNode>(undefined);
  const [options, setOptions] = useState<IApplicationOptions>();

  const changeOptions = (tmpOptions: IApplicationOptions): void => {
    navigate({
      pathname: location.pathname,
      search: `?time=${tmpOptions.times.time}&timeEnd=${tmpOptions.times.timeEnd}&timeStart=${
        tmpOptions.times.timeStart
      }&view=${tmpOptions.view}&filterUpstreamCluster=${encodeURIComponent(
        tmpOptions.filters.upstreamCluster,
      )}&filterMethod=${encodeURIComponent(tmpOptions.filters.method)}&filterPath=${encodeURIComponent(
        tmpOptions.filters.path,
      )}`,
    });
  };

  const setFilters = (filters: IFilters): void => {
    if (options) {
      navigate({
        pathname: location.pathname,
        search: `?timeEnd=${options.times.timeEnd}&timeStart=${options.times.timeStart}&view=${
          options.view
        }&filterUpstreamCluster=${encodeURIComponent(filters.upstreamCluster)}&filterMethod=${encodeURIComponent(
          filters.method,
        )}&filterPath=${encodeURIComponent(filters.path)}`,
      });
    }
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialApplicationOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options || !params.namespace || !params.application) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        toolbarContent={<ApplicationToolbar options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {options.view === 'metrics' ? (
          <ApplicationMetrics
            instance={instance}
            namespace={params.namespace}
            application={params.application}
            times={options.times}
            filters={options.filters}
            view={options.view}
            setDetails={setDetails}
          />
        ) : options.view === 'top' ? (
          <ApplicationTop
            instance={instance}
            namespace={params.namespace}
            application={params.application}
            times={options.times}
            filters={options.filters}
            view={options.view}
            setFilters={setFilters}
            setDetails={setDetails}
          />
        ) : options.view === 'tap' ? (
          <ApplicationTap
            instance={instance}
            namespace={params.namespace}
            application={params.application}
            times={options.times}
            filters={options.filters}
            view={options.view}
            setFilters={setFilters}
            setDetails={setDetails}
          />
        ) : (
          <div />
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Application;
