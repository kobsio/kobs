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

import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageToolbar from './PageToolbar';
import Projects from './Projects';
import { getOptionsFromSearch } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({
  name,
  displayName,
  description,
  options,
}: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [pageOptions, setPageOptions] = useState<IOptions>(getOptionsFromSearch(location.search));

  // changePageOptions is used to change the options to get a list of projects from SonarQube. Instead of directly
  // modifying the options state we change the URL parameters.
  const changePageOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${encodeURIComponent(opts.query)}`,
    });
  };

  // useEffect is used to set the options every time the search location for the current URL changes. The URL is changed
  // via the changePageOptions function. When the search location is changed we modify the options state.
  useEffect(() => {
    setPageOptions(getOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar name={name} query={pageOptions.query} setOptions={changePageOptions} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <Projects name={name} query={pageOptions.query} url={options && options.url ? options.url : ''} />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
