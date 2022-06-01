import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageSQL from './PageSQL';
import PageToolbar from './PageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();

  // changeOptions is used to change the options for an SQL query. Instead of directly modifying the options state we
  // change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    navigate(`${location.pathname}?query=${opts.query}`);
  };

  useEffect(() => {
    setOptions(getInitialOptions(location.search));
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
        hasPadding={true}
        toolbarContent={<PageToolbar options={options} setOptions={changeOptions} />}
        panelContent={undefined}
      >
        {options.query.length > 0 ? <PageSQL instance={instance} query={options.query} /> : <div></div>}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
