import React from 'react';

import { IDocument } from '../../utils/interfaces';
import { getKeyValues } from '../../utils/helpers';

export interface ILogsDocumentPreviewProps {
  document: IDocument;
}

const LogsDocumentPreview: React.FunctionComponent<ILogsDocumentPreviewProps> = ({
  document,
}: ILogsDocumentPreviewProps) => {
  const fields = getKeyValues(document['_source']);

  return (
    <div className="kobsio-elasticsearch-logs-preview">
      {fields.map((field) => (
        <span key={field.key} className="pf-u-mr-sm pf-u-mb-sm">
          <span className="pf-u-background-color-200 pf-u-p-xs">{field.key}:</span>
          <span className="pf-u-p-xs"> {field.value}</span>
        </span>
      ))}
    </div>
  );
};

export default LogsDocumentPreview;
