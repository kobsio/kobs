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

import { IPluginPageProps, IPluginTimes } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';
import PageLogs from './PageLogs';
import PageToolbar from './PageToolbar';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(useMemo<IOptions>(() => getInitialOptions(), []));

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const fields = opts.fields ? opts.fields.map((field) => `&field=${field}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?query=${opts.query}&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${
        opts.times.timeStart
      }${fields.length > 0 ? fields.join('') : ''}`,
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

  const addFilter = (filter: string): void => {
    changeOptions({ ...options, query: `${options.query} ${filter}` });
  };

  const changeTime = (times: IPluginTimes): void => {
    changeOptions({ ...options, times: times });
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
          <span className="pf-u-font-size-md pf-u-font-weight-normal" style={{ float: 'right' }}>
            <a href="https://kobs.io/plugins/elasticsearch/" target="_blank" rel="noreferrer">
              Documentation
            </a>
          </span>
        </Title>
        <p>{description}</p>
        <PageToolbar options={options} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.query.length > 0 ? (
                <PageLogs
                  name={name}
                  fields={options.fields}
                  query={options.query}
                  addFilter={addFilter}
                  changeTime={changeTime}
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

export default Page;
