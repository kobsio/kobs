import { Gallery, PageSection, PageSectionVariants, Pagination, PaginationVariant } from '@patternfly/react-core';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import { PageContentSection, PageHeaderSection, useDebounce } from '@kobsio/shared';
import { IOptions } from './utils/interfaces';
import Module from '../module/Module';
import PluginInstancesError from './PluginInstancesError';
import PluginInstancesLoading from './PluginInstancesLoading';
import PluginInstancesToolbar from './PluginInstancesToolbar';
import { getInitialOptions } from './utils/helpers';

const PluginInstances: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  const [options, setOptions] = useState<IOptions>({
    page: 1,
    perPage: 10,
    pluginSatellite: '',
    pluginType: '',
    searchTerm: '',
  });
  const debouncedSearchTerm = useDebounce<string>(options.searchTerm, 500);

  const changeOptions = (opts: IOptions): void => {
    navigate(
      `${location.pathname}?pluginSatellite=${opts.pluginSatellite}&pluginType=${
        opts.pluginType
      }&searchTerm=${encodeURIComponent(opts.searchTerm)}&page=${opts.page}&perPage=${opts.perPage}`,
    );
  };

  useEffect(() => {
    setOptions(getInitialOptions(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageHeaderSection
        title="Plugins"
        description="A list of all available plugins, which can be used within your applications, dashboards, teams and users. You can also select a plugin to directly interact with the underlying service."
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<PluginInstancesToolbar options={options} setOptions={changeOptions} />}
        panelContent={undefined}
      >
        <Gallery hasGutter={true}>
          {pluginsContext
            .getInstances(options.pluginSatellite, options.pluginType, debouncedSearchTerm)
            .slice((options.page - 1) * options.perPage, options.page * options.perPage)
            .map((instance) => (
              <Module
                key={instance.id}
                version={pluginsContext.version}
                name={instance.type}
                module="./Instance"
                props={instance}
                errorContent={PluginInstancesError}
                loadingContent={PluginInstancesLoading}
              />
            ))}
        </Gallery>
      </PageContentSection>

      <PageSection
        isFilled={false}
        sticky="bottom"
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
      >
        <Pagination
          itemCount={
            pluginsContext.getInstances(options.pluginSatellite, options.pluginType, debouncedSearchTerm).length
          }
          perPage={options.perPage}
          page={options.page}
          variant={PaginationVariant.bottom}
          onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
            changeOptions({ ...options, page: newPage })
          }
          onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
            changeOptions({ ...options, page: 1, perPage: newPerPage })
          }
          onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            changeOptions({ ...options, page: newPage })
          }
          onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            changeOptions({ ...options, page: newPage })
          }
          onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            changeOptions({ ...options, page: newPage })
          }
          onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            changeOptions({ ...options, page: newPage })
          }
        />
      </PageSection>
    </React.Fragment>
  );
};

export default PluginInstances;
