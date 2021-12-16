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
import { getInitialOptions } from '../../utils/helpers';

interface ITracesProps {
  name: string;
  displayName: string;
  description: string;
}

const Traces: React.FunctionComponent<ITracesProps> = ({ name, displayName, description }: ITracesProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>();
  const [selectedTrace, setSelectedTrace] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
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
          <span className="pf-u-font-size-md pf-u-font-weight-normal" style={{ float: 'right' }}>
            <Link to={`/${name}/trace`}>Compare Traces</Link>
          </span>
        </Title>
        <p>{description}</p>
        <TracesToolbar name={name} options={options} setOptions={changeOptions} />
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
                  queries={[
                    {
                      limit: options.limit,
                      maxDuration: options.maxDuration,
                      minDuration: options.minDuration,
                      name: '',
                      operation: options.operation,
                      service: options.service,
                      tags: options.tags,
                    },
                  ]}
                  showChart={true}
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
