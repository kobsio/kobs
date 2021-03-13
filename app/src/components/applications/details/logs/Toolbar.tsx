import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Toolbar as PatternflyToolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

import { ApplicationLogsQuery } from 'generated/proto/application_pb';
import { IDatasourceOptions } from 'utils/proto';
import Options from 'components/applications/details/metrics/Options';

interface IToolbarProps {
  datasourcenName: string;
  datasourceType: string;
  datasourceOptions: IDatasourceOptions;
  setDatasourceOptions: (options: IDatasourceOptions) => void;
  queries: ApplicationLogsQuery[];
  query?: ApplicationLogsQuery;
  selectQuery: (q: ApplicationLogsQuery) => void;
}

// Toolbar shows the options for a logs datasource, where the user can select the time range for which he wants to fetch
// the logs. The user can also select a defined query for an application.
const Toolbar: React.FunctionComponent<IToolbarProps> = ({
  datasourcenName,
  datasourceType,
  datasourceOptions,
  setDatasourceOptions,
  queries,
  query,
  selectQuery,
}: IToolbarProps) => {
  const [show, setShow] = useState<boolean>(false);

  // selectDropdownItem is the function is called, when a user selects a query from the dropdown component. When a query
  // is selected, we set this query as the current query and we close the dropdown.
  const selectDropdownItem = (q: ApplicationLogsQuery): void => {
    selectQuery(q);
    setShow(false);
  };

  return (
    <PatternflyToolbar id="metrics-toolbar">
      <ToolbarContent>
        <ToolbarToggleGroup className="kobs-fullwidth" toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup>
            <ToolbarItem>
              <Dropdown
                className="kobsio-dropdown"
                toggle={
                  <DropdownToggle
                    id="logs-toolbar-queries"
                    onToggle={(): void => setShow(!show)}
                    toggleIndicator={CaretDownIcon}
                  >
                    {query ? query.getName() : 'Queries'}
                  </DropdownToggle>
                }
                isOpen={show}
                dropdownItems={queries.map((q, index) => (
                  <DropdownItem
                    key={index}
                    component="button"
                    onClick={(): void => selectDropdownItem(q)}
                    description={q.getQuery()}
                  >
                    {q.getName()}
                  </DropdownItem>
                ))}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarGroup className="kobs-fullwidth">
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <Options type={datasourceType} options={datasourceOptions} setOptions={setDatasourceOptions} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </PatternflyToolbar>
  );
};

export default Toolbar;
