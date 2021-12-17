import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import Alerts from '../panel/Alerts';
import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import Incidents from '../panel/Incidents';
import PageToolbar from './PageToolbar';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options to get a list of traces from Jaeger. Instead of directly modifying the
  // options state we change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${encodeURIComponent(opts.query)}&type=${opts.type}&time=${opts.times.time}&timeEnd=${
        opts.times.timeEnd
      }&timeStart=${opts.times.timeStart}`,
    });
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
  }, [location.search]);

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar name={name} options={options} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.type === 'alerts' ? (
                <Alerts name={name} query={options.query} times={options.times} setDetails={setDetails} />
              ) : options.type === 'incidents' ? (
                <Incidents name={name} query={options.query} times={options.times} setDetails={setDetails} />
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
