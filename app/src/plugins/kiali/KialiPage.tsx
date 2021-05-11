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

import { IKialiOptions, getOptionsFromSearch } from 'plugins/kiali/helpers';
import { IPluginPageProps } from 'utils/plugins';
import KialiGraphWrapper from 'plugins/kiali/KialiGraphWrapper';
import KialiPageToolbar from 'plugins/kiali/KialiPageToolbar';

const KialiPage: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [options, setOptions] = useState<IKialiOptions>(getOptionsFromSearch(location.search));
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const changeOptions = (opts: IKialiOptions): void => {
    const namespaces = opts.namespaces ? opts.namespaces.map((field) => `&namespace=${field}`) : undefined;

    history.push({
      pathname: location.pathname,
      search: `?duration=${opts.duration}${namespaces && namespaces.length > 0 ? namespaces.join('') : ''}`,
    });
  };

  useEffect(() => {
    setOptions(getOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {name}
        </Title>
        <p>{description}</p>
        <KialiPageToolbar
          name={name}
          namespaces={options.namespaces}
          duration={options.duration}
          setOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.namespaces.length > 0 ? (
                <KialiGraphWrapper
                  name={name}
                  namespaces={options.namespaces}
                  duration={options.duration}
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

export default KialiPage;
