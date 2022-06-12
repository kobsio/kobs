import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, fileDownload, pluginBasePath } from '@kobsio/shared';
import { IAggregationData } from '../../utils/interfaces';

interface IAggregationActionsProps {
  instance: IPluginInstance;
  query: string;
  times: ITimes;
  data?: IAggregationData;
  isFetching: boolean;
}

export const AggregationActions: React.FunctionComponent<IAggregationActionsProps> = ({
  instance,
  query,
  times,
  data,
  isFetching,
}: IAggregationActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  const downloadCSV = (): void => {
    if (data && data.columns && data.rows) {
      let csv = '';

      for (const row of data.rows) {
        for (const column of data.columns) {
          csv = csv + (row.hasOwnProperty(column) ? row[column] : '-') + ';';
        }

        csv = csv + '\r\n';
      }

      fileDownload(csv, 'kobs-export-aggregation.csv');
    }

    setShow(false);
  };

  return (
    <CardActions>
      {isFetching ? (
        <Spinner size="md" />
      ) : (
        <Dropdown
          toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
          isOpen={show}
          isPlain={true}
          position="right"
          dropdownItems={[
            <DropdownItem
              key={0}
              component={
                <Link
                  to={`${pluginBasePath(instance)}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${
                    times.timeStart
                  }&query=${encodeURIComponent(query)}`}
                >
                  Logs
                </Link>
              }
            />,
            <DropdownItem key={1} isDisabled={!data || !data.columns || !data.rows} onClick={(): void => downloadCSV()}>
              Download CSV
            </DropdownItem>,
          ]}
        />
      )}
    </CardActions>
  );
};

export default AggregationActions;
