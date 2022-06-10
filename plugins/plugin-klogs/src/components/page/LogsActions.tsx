import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, fileDownload, pluginBasePath } from '@kobsio/shared';
import { IDocument } from '../../utils/interfaces';
import { formatTime } from '../../utils/helpers';

interface ILogsActionsProps {
  instance: IPluginInstance;
  query: string;
  times: ITimes;
  documents?: IDocument[];
  fields?: string[];
  isFetching: boolean;
}

export const LogsActions: React.FunctionComponent<ILogsActionsProps> = ({
  instance,
  query,
  times,
  documents,
  fields,
  isFetching,
}: ILogsActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  // downloadLogs lets a user download the returned documents as raw logs.
  const downloadLogs = (): void => {
    if (documents) {
      let log = '';

      for (const document of documents) {
        log = log + document['log'];
      }

      fileDownload(log, 'kobs-export-logs.log');
    }

    setShow(false);
  };

  // downloadCSV lets a user donwload the returned documents as csv file, with the selected fields as columns.
  const downloadCSV = (): void => {
    if (documents && fields) {
      let csv = '';

      for (const document of documents) {
        csv = csv + formatTime(document['timestamp']);

        for (const field of fields) {
          csv = csv + ';' + (document.hasOwnProperty(field) ? document[field] : '-');
        }

        csv = csv + '\r\n';
      }

      fileDownload(csv, 'kobs-export-logs.csv');
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
                  to={`${pluginBasePath(instance)}/aggregation?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${
                    times.timeStart
                  }&query=${encodeURIComponent(query)}`}
                >
                  Aggregation
                </Link>
              }
            />,
            <DropdownItem key={1} isDisabled={!documents} onClick={(): void => downloadLogs()}>
              Download Logs
            </DropdownItem>,
            <DropdownItem key={2} isDisabled={!documents || !fields} onClick={(): void => downloadCSV()}>
              Download CSV
            </DropdownItem>,
          ]}
        />
      )}
    </CardActions>
  );
};

export default LogsActions;
