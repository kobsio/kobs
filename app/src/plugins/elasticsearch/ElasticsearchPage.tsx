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

import { IElasticsearchOptions, getOptionsFromSearch } from 'plugins/elasticsearch/helpers';
import ElasticsearchLogs from 'plugins/elasticsearch/ElasticsearchLogs';
import ElasticsearchPageToolbar from 'plugins/elasticsearch/ElasticsearchPageToolbar';
import { IPluginPageProps } from 'utils/plugins';

// ElasticsearchPage implements the page component for the Elasticsearch plugin. It is used to render the toolbar and
// the drawer for Elasticsearch.
const ElasticsearchPage: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [options, setOptions] = useState<IElasticsearchOptions>(getOptionsFromSearch(location.search));
  const [document, setDocument] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options for an Elasticsearch query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (opts: IElasticsearchOptions): void => {
    const params = new URLSearchParams(location.search);
    const fields = opts.fields
      ? opts.fields.map((field) => `&field=${field}`)
      : params.getAll('field').map((field) => `&field=${field}`);

    history.push({
      pathname: location.pathname,
      search: `?query=${opts.query}${fields && fields.length > 0 ? fields.join('') : ''}&timeEnd=${
        opts.timeEnd
      }&timeStart=${opts.timeStart}`,
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

  // setScrollID is used to set the scroll id for pageination. We do not set the scroll id via the search location to
  // allow sharing of the current query.
  const setScrollID = (scrollID: string): void => {
    setOptions({ ...options, scrollID: scrollID });
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
        </Title>
        <p>{description}</p>
        <ElasticsearchPageToolbar
          query={options.query}
          queryName=""
          timeEnd={options.timeEnd}
          timeStart={options.timeStart}
          setOptions={changeOptions}
        />
      </PageSection>

      <Drawer isExpanded={document !== undefined}>
        <DrawerContent panelContent={document}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {options.query ? (
                <ElasticsearchLogs
                  name={name}
                  queryName=""
                  fields={options.fields}
                  query={options.query}
                  scrollID={options.scrollID}
                  timeEnd={options.timeEnd}
                  timeStart={options.timeStart}
                  setDocument={setDocument}
                  setScrollID={setScrollID}
                  selectField={selectField}
                  showActions={true}
                />
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default ElasticsearchPage;
