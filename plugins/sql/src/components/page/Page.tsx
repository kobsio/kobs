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
import PageSQL from './PageSQL';
import PageToolbar from './PageToolbar';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>();

  // changeOptions is used to change the options for an SQL query. Instead of directly modifying the options state we
  // change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${opts.query}`,
    });
  };

  useEffect(() => {
    setOptions(getInitialOptions(location.search));
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
        <PageToolbar options={options} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.query.length > 0 && <PageSQL name={name} query={options.query} />}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
