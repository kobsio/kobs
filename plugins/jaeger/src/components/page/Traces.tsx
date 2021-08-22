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

import { IOptions } from '../../utils/interfaces';
import TracesPanel from '../panel/Traces';
import TracesToolbar from './TracesToolbar';
import { getOptionsFromSearch } from '../../utils/helpers';

interface ITracesProps {
  name: string;
  displayName: string;
  description: string;
}

const Traces: React.FunctionComponent<ITracesProps> = ({ name, displayName, description }: ITracesProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(getOptionsFromSearch(location.search));
  const [selectedTrace, setSelectedTrace] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options to get a list of traces from Jaeger. Instead of directly modifying the
  // options state we change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?limit=${opts.limit}&maxDuration=${opts.maxDuration}&minDuration=${opts.minDuration}&operation=${
        opts.operation === 'All Operations' ? '' : opts.operation
      }&service=${opts.service}&tags=${opts.tags}&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${
        opts.times.timeStart
      }`,
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
          <span className="pf-u-font-size-md pf-u-font-weight-normal" style={{ float: 'right' }}>
            <Link to={`/${name}/trace`}>Compare Traces</Link>
          </span>
        </Title>
        <p>{description}</p>
        <TracesToolbar
          name={name}
          limit={options.limit}
          maxDuration={options.maxDuration}
          minDuration={options.minDuration}
          operation={options.operation}
          service={options.service}
          tags={options.tags}
          times={options.times}
          setOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={selectedTrace !== undefined}>
        <DrawerContent panelContent={selectedTrace}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.service ? (
                <TracesPanel
                  name={name}
                  title=""
                  showDetails={setSelectedTrace}
                  showChart={true}
                  limit={options.limit}
                  maxDuration={options.maxDuration}
                  minDuration={options.minDuration}
                  operation={options.operation}
                  service={options.service}
                  tags={options.tags}
                  times={options.times}
                />
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Traces;
