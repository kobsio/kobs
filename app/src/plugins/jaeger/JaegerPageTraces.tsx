import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import { Link, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { IJaegerOptions, getOptionsFromSearch } from 'plugins/jaeger/helpers';
import { IPluginPageProps } from 'utils/plugins';
import JaegerPageToolbar from 'plugins/jaeger/JaegerPageToolbar';
import JaegerTraces from 'plugins/jaeger/JaegerTraces';

const JaegerPageTraces: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [options, setOptions] = useState<IJaegerOptions>(getOptionsFromSearch(location.search));
  const [trace, setTrace] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options for an Jaeger query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (opts: IJaegerOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?limit=${opts.limit}&maxDuration=${opts.maxDuration}&minDuration=${opts.minDuration}&operation=${opts.operation}&service=${opts.service}&tags=${opts.tags}&timeEnd=${opts.timeEnd}&timeStart=${opts.timeStart}`,
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
          {name}
          <span className="pf-u-font-size-md pf-u-font-weight-normal" style={{ float: 'right' }}>
            <Link to={`/plugins/${name}/trace`}>Compare Traces</Link>
          </span>
        </Title>
        <p>{description}</p>
        <JaegerPageToolbar
          name={name}
          queryName=""
          limit={options.limit}
          maxDuration={options.maxDuration}
          minDuration={options.minDuration}
          operation={options.operation}
          service={options.service}
          tags={options.tags}
          timeEnd={options.timeEnd}
          timeStart={options.timeStart}
          changeOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={trace !== undefined}>
        <DrawerContent panelContent={trace}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.service ? (
                <JaegerTraces
                  name={name}
                  queryName=""
                  limit={options.limit}
                  maxDuration={options.maxDuration}
                  minDuration={options.minDuration}
                  operation={options.operation}
                  service={options.service}
                  tags={options.tags}
                  timeEnd={options.timeEnd}
                  timeStart={options.timeStart}
                  setTrace={setTrace}
                />
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default JaegerPageTraces;
