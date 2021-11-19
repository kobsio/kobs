import {
  Divider,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Flex,
  FlexItem,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import { Link, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { IOptions } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import Logs from './Logs';
import LogsToolbar from './LogsToolbar';
import { getOptionsFromSearch } from '../../utils/helpers';

interface ILogsPageProps {
  name: string;
  displayName: string;
  description: string;
}

const LogsPage: React.FunctionComponent<ILogsPageProps> = ({ name, displayName, description }: ILogsPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(getOptionsFromSearch(location.search));

  // changeOptions is used to change the options for an klogs query. Instead of directly modifying the options state we
  // change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    const fields = opts.fields ? opts.fields.map((field) => `&field=${field}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?query=${encodeURIComponent(opts.query)}&order=${opts.order}&orderBy=${opts.orderBy}&timeEnd=${
        opts.times.timeEnd
      }&timeStart=${opts.times.timeStart}${fields.length > 0 ? fields.join('') : ''}`,
    });
  };

  // selectField is used to add a field as parameter, when it isn't present and to remove a fields from as parameter,
  // when it is already present via the changeOptions function.
  const selectField = (field: string): void => {
    let tmpFields: string[] = [];
    if (options.fields) {
      tmpFields = [...options.fields];
    }

    if (tmpFields.includes(field)) {
      tmpFields = tmpFields.filter((f) => f !== field);
    } else {
      tmpFields.push(field);
    }

    changeOptions({ ...options, fields: tmpFields });
  };

  const addFilter = (filter: string): void => {
    changeOptions({ ...options, query: `${options.query} ${filter}` });
  };

  const changeTime = (times: IPluginTimes): void => {
    changeOptions({ ...options, times: times });
  };

  const changeOrder = (order: string, orderBy: string): void => {
    changeOptions({ ...options, order: order, orderBy: orderBy });
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
            <Flex>
              <FlexItem>
                <Link to={`/${name}/aggregation`}>Aggregation</Link>
              </FlexItem>
              <Divider isVertical={true} />
              <FlexItem>
                <a href="https://kobs.io/plugins/klogs/" target="_blank" rel="noreferrer">
                  Documentation
                </a>
              </FlexItem>
            </Flex>
          </span>
        </Title>
        <p>{description}</p>
        <LogsToolbar
          query={options.query}
          order={options.order}
          orderBy={options.orderBy}
          fields={options.fields}
          times={options.times}
          setOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.query.length > 0 ? (
                <Logs
                  name={name}
                  fields={options.fields}
                  query={options.query}
                  order={options.order}
                  orderBy={options.orderBy}
                  addFilter={addFilter}
                  changeTime={changeTime}
                  changeOrder={changeOrder}
                  selectField={selectField}
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

export default LogsPage;
