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
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({
  name,
  displayName,
  description,
  options,
}: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [pageOptions, setPageOptions] = useState<IOptions>();

  // changePageOptions is used to change the options to get a list of projects from SonarQube. Instead of directly
  // modifying the options state we change the URL parameters.
  const changePageOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${encodeURIComponent(opts.query)}`,
    });
  };

  useEffect(() => {
    setPageOptions(getInitialOptions(location.search));
  }, [location.search]);

  if (!pageOptions) {
    return null;
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar name={name} options={pageOptions} setOptions={changePageOptions} />
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
