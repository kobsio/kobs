import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import GraphWrapper from '../panel/GraphWrapper';
import { IOptions } from '../../utils/interfaces';
import PageToolbar from './PageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (opts: IOptions): void => {
    const namespaces = opts.namespaces ? opts.namespaces.map((namespace) => `&namespace=${namespace}`) : [];

    navigate({
      pathname: location.pathname,
      search: `?time=${opts.times.time}&timeStart=${opts.times.timeStart}&timeEnd=${opts.times.timeEnd}${
        namespaces.length > 0 ? namespaces.join('') : ''
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
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />
      <PageContentSection
        toolbarContent={<PageToolbar instance={instance} options={options} setOptions={changeOptions} />}
        hasPadding={true}
        panelContent={details}
      >
        {options.namespaces && options.namespaces.length > 0 ? (
          <GraphWrapper
            instance={instance}
            namespaces={options.namespaces}
            times={options.times}
            setDetails={setDetails}
          />
        ) : (
          <div />
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
