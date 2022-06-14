import {
  Alert,
  AlertVariant,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface IDashboardsPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

const DashboardsPanel: React.FunctionComponent<IDashboardsPanelProps> = ({ options }: IDashboardsPanelProps) => {
  const navigate = useNavigate();

  const goToDashboard = (id: string): void => {
    const idParts = id.split('?');

    navigate(`/dashboards${idParts[0]}?${idParts[1]}`);
  };

  if (options && Array.isArray(options)) {
    return (
      <DataList aria-label="dashboards list" onSelectDataListItem={goToDashboard}>
        {options.map((dashboard) => {
          const placeholderParams = dashboard.placeholders
            ? Object.keys(dashboard.placeholders).map(
                (key) => `&${key}=${dashboard.placeholders ? dashboard.placeholders[key] : ''}`,
              )
            : undefined;

          const id = `/satellite/${dashboard.satellite}/cluster/${dashboard.cluster}/namespace/${
            dashboard.namespace
          }/name/${dashboard.name}?${
            placeholderParams && placeholderParams.length > 0 ? placeholderParams.join('') : ''
          }`;

          return (
            <DataListItem key={id} id={id} aria-labelledby={id}>
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="main">
                      <Flex direction={{ default: 'column' }}>
                        <FlexItem>
                          <p>
                            {dashboard.title}
                            <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                              {`(${dashboard.name} / ${dashboard.namespace} / ${dashboard.cluster})`}
                            </span>
                          </p>
                          <small>{dashboard.description}</small>
                        </FlexItem>
                      </Flex>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          );
        })}
      </DataList>
    );
  }

  return (
    <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
      The provided options for the <b>dashboards</b> plugin are invalid.
    </Alert>
  );
};

export default DashboardsPanel;
