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

import GraphWrapper from '../panel/GraphWrapper';
import { IPanelOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageToolbar from './PageToolbar';
import { getOptionsFromSearch } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IPanelOptions>(getOptionsFromSearch(location.search));
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options to get a list of traces from Jaeger. Instead of directly modifying the
  // options state we change the URL parameters.
  const changeOptions = (opts: IPanelOptions): void => {
    const namespaces = opts.namespaces ? opts.namespaces.map((namespace) => `&namespace=${namespace}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?duration=${opts.duration}${namespaces.length > 0 ? namespaces.join('') : ''}`,
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
          duration={options.duration}
          namespaces={options.namespaces}
          setOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.namespaces && options.namespaces.length > 0 ? (
                <GraphWrapper
                  name={name}
                  namespaces={options.namespaces}
                  duration={options.duration || 900}
                  setDetails={setDetails}
                />
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
