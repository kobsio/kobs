import { Flex, FlexItem } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle, PluginPanel } from '@kobsio/shared';
import { IOptionsLogs } from '../../utils/interfaces';
import Logs from '../panel/Logs';
import LogsPageActions from './LogsPageActions';
import LogsPageToolbar from './LogsPageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptionsLogs } from '../../utils/helpers';

interface ILogsPageProps {
  instance: IPluginInstance;
}

const LogsPage: React.FunctionComponent<ILogsPageProps> = ({ instance }: ILogsPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptionsLogs>();

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptionsLogs): void => {
    navigate(
      `${location.pathname}?query=${encodeURIComponent(opts.query)}&time=${opts.times.time}&timeEnd=${
        opts.times.timeEnd
      }&timeStart=${opts.times.timeStart}`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptionsLogs(location.search, !prevOptions));
  }, [location.search]);

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
            actions={<LogsPageActions instance={instance} />}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<LogsPageToolbar options={options} setOptions={changeOptions} />}
        panelContent={undefined}
      >
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <PluginPanel title="Results">
              <Logs instance={instance} query={options.query} times={options.times} />
            </PluginPanel>
          </FlexItem>
        </Flex>
      </PageContentSection>
    </React.Fragment>
  );
};

export default LogsPage;
