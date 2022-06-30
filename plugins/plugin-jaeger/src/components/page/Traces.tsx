import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import TracesActions from './TracesActions';
import TracesPanel from '../panel/Traces';
import TracesToolbar from './TracesToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

interface ITracesProps {
  instance: IPluginInstance;
}

const Traces: React.FunctionComponent<ITracesProps> = ({ instance }: ITracesProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    navigate(
      `${location.pathname}?limit=${opts.limit}&maxDuration=${opts.maxDuration}&minDuration=${
        opts.minDuration
      }&operation=${opts.operation === 'All Operations' ? '' : opts.operation}&service=${opts.service}&tags=${
        opts.tags
      }&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
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
            actions={<TracesActions instance={instance} />}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<TracesToolbar instance={instance} options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {options.service ? (
          <TracesPanel
            instance={instance}
            setDetails={setDetails}
            query={{
              limit: options.limit,
              maxDuration: options.maxDuration,
              minDuration: options.minDuration,
              name: '',
              operation: options.operation,
              service: options.service,
              tags: options.tags,
            }}
            showChart={true}
            times={options.times}
          />
        ) : (
          <div></div>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Traces;
