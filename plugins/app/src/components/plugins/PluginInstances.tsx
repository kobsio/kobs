import {
  Gallery,
  PageSection,
  PageSectionVariants,
  Pagination,
  PaginationVariant,
  SearchInput,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import { PageContentSection, PageHeaderSection, Toolbar, ToolbarItem, useDebounce } from '@kobsio/shared';
import Module from '../module/Module';
import PluginInstancesError from './PluginInstancesError';
import PluginInstancesLoading from './PluginInstancesLoading';

const PluginInstances: React.FunctionComponent = () => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  const [state, setState] = useState<{
    page: number;
    perPage: number;
    pluginSatellite: string;
    pluginSatelliteIsOpen: boolean;
    pluginType: string;
    pluginTypeIsOpen: boolean;
    searchTerm: string;
  }>({
    page: 1,
    perPage: 10,
    pluginSatellite: '',
    pluginSatelliteIsOpen: false,
    pluginType: '',
    pluginTypeIsOpen: false,
    searchTerm: '',
  });
  const debouncedSearchTerm = useDebounce<string>(state.searchTerm, 500);

  return (
    <React.Fragment>
      <PageHeaderSection
        title="Plugins"
        description="A list of all available plugins, which can be used within your applications, dashboards, teams and users. You can also select a plugin to directly interact with the underlying service."
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={
          <Toolbar usePageInsets={true}>
            <ToolbarItem width="200px">
              <Select
                variant={SelectVariant.single}
                aria-label="Select satellite input"
                placeholderText="Satellite"
                onToggle={(): void => setState({ ...state, pluginSatelliteIsOpen: !state.pluginSatelliteIsOpen })}
                onSelect={(
                  event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
                  value: string | SelectOptionObject,
                ): void =>
                  setState({ ...state, page: 1, pluginSatellite: value.toString(), pluginSatelliteIsOpen: false })
                }
                onClear={(): void => setState({ ...state, page: 1, pluginSatellite: '' })}
                selections={state.pluginSatellite}
                isOpen={state.pluginSatelliteIsOpen}
                maxHeight="50vh"
              >
                {pluginsContext.getPluginSatellites().map((option) => (
                  <SelectOption key={option} value={option} />
                ))}
              </Select>
            </ToolbarItem>

            <ToolbarItem width="200px">
              <Select
                variant={SelectVariant.single}
                aria-label="Select plugin type input"
                placeholderText="Plugin Type"
                onToggle={(): void => setState({ ...state, pluginTypeIsOpen: !state.pluginTypeIsOpen })}
                onSelect={(
                  event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
                  value: string | SelectOptionObject,
                ): void => setState({ ...state, page: 1, pluginType: value.toString(), pluginTypeIsOpen: false })}
                onClear={(): void => setState({ ...state, page: 1, pluginType: '' })}
                selections={state.pluginType}
                isOpen={state.pluginTypeIsOpen}
                maxHeight="50vh"
              >
                {pluginsContext.getPluginTypes().map((option) => (
                  <SelectOption key={option} value={option} />
                ))}
              </Select>
            </ToolbarItem>

            <ToolbarItem grow={true}>
              <SearchInput
                aria-label="Search plugin input"
                onChange={(value: string): void => setState({ ...state, page: 1, searchTerm: value })}
                value={state.searchTerm}
                onClear={(): void => setState({ ...state, page: 1, searchTerm: '' })}
              />
            </ToolbarItem>
          </Toolbar>
        }
        panelContent={undefined}
      >
        <Gallery hasGutter={true}>
          {pluginsContext
            .getInstances(state.pluginSatellite, state.pluginType, debouncedSearchTerm)
            .slice((state.page - 1) * state.perPage, state.page * state.perPage)
            .map((instance) => (
              <Module
                key={instance.id}
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
          itemCount={pluginsContext.getInstances(state.pluginSatellite, state.pluginType, debouncedSearchTerm).length}
          perPage={state.perPage}
          page={state.page}
          variant={PaginationVariant.bottom}
          onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
            setState({ ...state, page: 1, perPage: newPerPage })
          }
          onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
          onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setState({ ...state, page: newPage })
          }
        />
      </PageSection>
    </React.Fragment>
  );
};

export default PluginInstances;
