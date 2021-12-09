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
import React, { useMemo, useState } from 'react';

import { IOptions } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import Logs from './Logs';
import LogsToolbar from './LogsToolbar';
import { getInitialOptions } from '../../utils/helpers';

interface ILogsPageProps {
  name: string;
  displayName: string;
  description: string;
}

const LogsPage: React.FunctionComponent<ILogsPageProps> = ({ name, displayName, description }: ILogsPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(useMemo<IOptions>(() => getInitialOptions(), []));

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const fields = opts.fields ? opts.fields.map((field) => `&field=${field}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?query=${encodeURIComponent(opts.query)}&order=${opts.order}&orderBy=${opts.orderBy}&time=${
        opts.times.time
      }&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}${fields.length > 0 ? fields.join('') : ''}`,
    });

    setOptions(opts);
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

  const changeFieldOrder = (oldIndex: number, newIndex: number): void => {
    if (options.fields) {
      const tmpFields = [...options.fields];
      const tmpField = tmpFields[oldIndex];

      tmpFields[oldIndex] = tmpFields[newIndex];
      tmpFields[newIndex] = tmpField;

      changeOptions({ ...options, fields: tmpFields });
    }
  };

  // addFilter adds the given filter as string to the query, so that it can be used to filter down an existing query.
  const addFilter = (filter: string): void => {
    changeOptions({ ...options, query: `${options.query} ${filter}` });
  };

  // changeTime changes the selected time range. This can be used to change the time outside of the toolbar, e.g. by
  // selecting a time range in the chart.
  const changeTime = (times: IPluginTimes): void => {
    changeOptions({ ...options, times: times });
  };

  // changeOrder changes the order parameters for a query.
  const changeOrder = (order: string, orderBy: string): void => {
    changeOptions({ ...options, order: order, orderBy: orderBy });
  };

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
        <LogsToolbar options={options} setOptions={changeOptions} />
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
                  changeFieldOrder={changeFieldOrder}
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
