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

import { IPluginPageProps, IPluginTimes } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';
import PageLogs from './PageLogs';
import PageToolbar from './PageToolbar';
import { getOptionsFromSearch } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IOptions>(getOptionsFromSearch(location.search));

  // changeOptions is used to change the options for an Elasticsearch query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    const fields = opts.fields ? opts.fields.map((field) => `&field=${field}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?query=${opts.query}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}${
        fields.length > 0 ? fields.join('') : ''
      }`,
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
            <a href="https://kobs.io/plugins/elasticsearch/" target="_blank" rel="noreferrer">
              Documentation
            </a>
          </span>
        </Title>
        <p>{description}</p>
        <PageToolbar query={options.query} fields={options.fields} times={options.times} setOptions={changeOptions} />
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
