import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { IDocument, formatTimeWrapper } from 'plugins/elasticsearch/helpers';
import Editor from 'components/Editor';
import Title from 'components/Title';

export interface IElasticsearchLogsDocumentProps {
  document: IDocument;
  close: () => void;
}

// Document renders a single document in a drawer panel. We show the whole JSON representation for this document in a
// code view. The highlighting of this JSON document is handled by highlight.js.
const ElasticsearchLogsDocument: React.FunctionComponent<IElasticsearchLogsDocumentProps> = ({
  document,
  close,
}: IElasticsearchLogsDocumentProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={formatTimeWrapper(document['_source']['@timestamp'])}
          subtitle={`${document['_id']} (${document['_index']})`}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Editor value={JSON.stringify(document, null, 2)} mode="json" readOnly={true} />
        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ElasticsearchLogsDocument;
