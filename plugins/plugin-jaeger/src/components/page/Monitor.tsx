import { Grid, GridItem } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IMonitorOptions } from '../../utils/interfaces';
import MonitorActions from './MonitorActions';
import MonitorOperations from '../panel/MonitorOperations';
import MonitorServiceCalls from '../panel/MonitorServiceCalls';
import MonitorServiceErrors from '../panel/MonitorServiceErrors';
import MonitorServiceLatency from '../panel/MonitorServiceLatency';
import MonitorToolbar from './MonitorToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialMonitorOptions } from '../../utils/helpers';

interface IMonitorProps {
  instance: IPluginInstance;
}

const Monitor: React.FunctionComponent<IMonitorProps> = ({ instance }: IMonitorProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IMonitorOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const changeOptions = (opts: IMonitorOptions): void => {
    const spanKinds = opts.spanKinds.map((spanKind) => `&spanKind=${spanKind}`);

    navigate(
      `${location.pathname}?service=${encodeURIComponent(opts.service)}${
        spanKinds.length > 0 ? spanKinds.join('') : ''
      }&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialMonitorOptions(location.search, !prevOptions));
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
            actions={<MonitorActions instance={instance} />}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<MonitorToolbar instance={instance} options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {options.service && options.spanKinds.length > 0 ? (
          <Grid hasGutter={true}>
            <GridItem style={{ height: '300px' }} sm={12} md={12} lg={4} xl={4} xl2={4}>
              <MonitorServiceLatency
                title="Latency (ms)"
                instance={instance}
                service={options.service}
                spanKinds={options.spanKinds}
                times={options.times}
              />
            </GridItem>
            <GridItem style={{ height: '300px' }} sm={12} md={12} lg={4} xl={4} xl2={4}>
              <MonitorServiceErrors
                title="Error Rate (%)"
                instance={instance}
                service={options.service}
                spanKinds={options.spanKinds}
                times={options.times}
              />
            </GridItem>
            <GridItem style={{ height: '300px' }} sm={12} md={12} lg={4} xl={4} xl2={4}>
              <MonitorServiceCalls
                title="Request Rate (req/s)"
                instance={instance}
                service={options.service}
                spanKinds={options.spanKinds}
                times={options.times}
              />
            </GridItem>
            <GridItem span={12}>
              <MonitorOperations
                title="Operations"
                instance={instance}
                service={options.service}
                spanKinds={options.spanKinds}
                times={options.times}
                setDetails={setDetails}
              />
            </GridItem>
          </Grid>
        ) : (
          <div></div>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Monitor;
