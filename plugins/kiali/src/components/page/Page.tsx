import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import GraphWrapper from '../panel/GraphWrapper';
import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageToolbar from './PageToolbar';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(useMemo<IOptions>(() => getInitialOptions(), []));
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const namespaces = opts.namespaces ? opts.namespaces.map((namespace) => `&namespace=${namespace}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?time=${opts.times.time}&timeStart=${opts.times.timeStart}&timeEnd=${opts.times.timeEnd}${
        namespaces.length > 0 ? namespaces.join('') : ''
      }`,
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

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.namespaces && options.namespaces.length > 0 ? (
                <GraphWrapper
                  name={name}
                  namespaces={options.namespaces}
                  times={options.times}
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
