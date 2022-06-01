import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageToolbar from './PageToolbar';
import Projects from './Projects';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();

  // changeOptions is used to change the options to get a list of projects from SonarQube. Instead of directly
  // modifying the options state we change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    navigate(`${location.pathname}?query=${encodeURIComponent(opts.query)}`);
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
        <Projects instance={instance} query={options.query} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
