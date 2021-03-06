import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { TabContent } from '@patternfly/react-core';

import { Application } from 'generated/proto/application_pb';
import { IDatasourceOptions } from 'utils/proto';
import Metrics from 'components/applications/details/metrics/Metrics';
import Resources from 'components/applications/details/resources/Resources';

// IParsedDatasourceOptions is the interface for the parsed query parameters. It must contain the same keys as the
// IDatasourceOptions options, but all keys must be of type string.
interface IParsedDatasourceOptions {
  resolution: string;
  timeEnd: string;
  timeStart: string;
}

// datasourceOptionsFromLocationSearch is used to parse all query parameters during the first rendering of the
// TabsContent component. When the parameters are not set we return some default options for the datasources. Because it
// could happen that only some parameters are set via location.search, we have to check each property if it contains a
// valid value. If this is the case we are overwriting the default value.
const datasourceOptionsFromLocationSearch = (): IDatasourceOptions => {
  const search = window.location.search;
  const options: IDatasourceOptions = {
    resolution: '',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 3600,
  };

  if (search !== '') {
    try {
      const parsedOptions: IParsedDatasourceOptions = JSON.parse(
        '{"' + search.substr(1).replace(/&/g, '", "').replace(/=/g, '": "') + '"}',
      );

      if (parsedOptions.resolution) options.resolution = parsedOptions.resolution;
      if (parsedOptions.timeEnd) options.timeEnd = parseInt(parsedOptions.timeEnd);
      if (parsedOptions.timeStart) options.timeStart = parseInt(parsedOptions.timeStart);
    } catch (err) {
      return options;
    }
  }

  return options;
};

// createSearch creates a string, which can be used within the history.push function as search parameter. For that we
// are looping over each key of the IDatasourceOptions interface and if it contains a value, this value will be added to
// the parameters.
const createSearch = (options: IDatasourceOptions): string => {
  const params: string[] = [];

  let option: keyof IDatasourceOptions;
  for (option in options) {
    if (options[option]) {
      params.push(`${option}=${options[option]}`);
    }
  }

  return `?${params.join('&')}`;
};

interface ITabsContent {
  application: Application;
  tab: string;
  refResourcesContent: React.RefObject<HTMLElement>;
  refMetricsContent: React.RefObject<HTMLElement>;
}

// TabsContent renders the content for a selected tab from the Tabs component. We also manage the datasource options,
// within this component, so that we can share the selected time range between metrics, logs and traces.
// When the datasource options are changed, we also reflect this change in the URL via query parameters, so that a user
// can share his current view with other users.
const TabsContent: React.FunctionComponent<ITabsContent> = ({
  application,
  tab,
  refResourcesContent,
  refMetricsContent,
}: ITabsContent) => {
  const history = useHistory();
  const location = useLocation();
  const [datasourceOptions, setDatasourceOptions] = useState<IDatasourceOptions>(datasourceOptionsFromLocationSearch());

  const changeDatasourceOptions = (options: IDatasourceOptions): void => {
    setDatasourceOptions(options);

    history.push({
      pathname: location.pathname,
      search: createSearch(options),
    });
  };

  return (
    <React.Fragment>
      <TabContent
        eventKey="resources"
        id="refResources"
        activeKey={tab}
        ref={refResourcesContent}
        aria-label="Resources"
      >
        <div>
          <Resources application={application} />
        </div>
      </TabContent>
      <TabContent eventKey="metrics" id="refMetrics" activeKey={tab} ref={refMetricsContent} aria-label="Metrics">
        {/* We have to check if the refMetricsContent is not null, because otherwise the Metrics component will be shown below the resources component. */}
        <div>
          {refMetricsContent.current ? (
            <Metrics
              datasourceOptions={datasourceOptions}
              setDatasourceOptions={changeDatasourceOptions}
              application={application}
            />
          ) : null}
        </div>
      </TabContent>
    </React.Fragment>
  );
};

export default TabsContent;
