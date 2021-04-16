import {
  Card,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { FilterIcon } from '@patternfly/react-icons';

import { Query } from 'proto/opsgenie_grpc_web_pb';

interface IOpsgeniePluginToolbarProps {
  queries: Query.AsObject[];
  query?: Query.AsObject;
  setQuery: (query: Query.AsObject) => void;
}

// OpsgeniePluginToolbar renders the toolbar, where a user can select an alert from the list of alerts, which was
// defined within an application or resource.
const OpsgeniePluginToolbar: React.FunctionComponent<IOpsgeniePluginToolbarProps> = ({
  queries,
  query,
  setQuery,
}: IOpsgeniePluginToolbarProps) => {
  const [show, setShow] = useState<boolean>(false);

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const q = queries.filter((q) => q.name === value);
    if (q.length === 1) {
      setQuery(q[0]);
      setShow(false);
    }
  };

  return (
    <Card>
      <Toolbar id="opsgenie-toolbar">
        <ToolbarContent>
          <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
            <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
              <ToolbarItem style={{ width: '100%' }}>
                <Select
                  variant={SelectVariant.single}
                  typeAheadAriaLabel={`Select query`}
                  placeholderText={`Select query`}
                  onToggle={(): void => setShow(!show)}
                  onSelect={onSelect}
                  selections={query ? query.name : undefined}
                  isOpen={show}
                >
                  {queries.map((q, index) => (
                    <SelectOption key={index} value={q.name} description={q.query} />
                  ))}
                </Select>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    </Card>
  );
};

export default OpsgeniePluginToolbar;
