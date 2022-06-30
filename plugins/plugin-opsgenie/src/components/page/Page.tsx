import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@patternfly/react-core';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import Alerts from '../panel/Alerts';
import { IOptions } from '../../utils/interfaces';
import Incidents from '../panel/Incidents';
import PageToolbar from './PageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    navigate(
      `${location.pathname}?query=${encodeURIComponent(opts.query)}&type=${opts.type}&time=${opts.times.time}&timeEnd=${
        opts.times.timeEnd
      }&timeStart=${opts.times.timeStart}`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options) {
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
        hasDivider={true}
        toolbarContent={<PageToolbar options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {options.type === 'alerts' ? (
          <Card isCompact={true}>
            <Alerts instance={instance} query={options.query} times={options.times} setDetails={setDetails} />
          </Card>
        ) : options.type === 'incidents' ? (
          <Card isCompact={true}>
            <Incidents instance={instance} query={options.query} times={options.times} setDetails={setDetails} />
          </Card>
        ) : (
          <div></div>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
