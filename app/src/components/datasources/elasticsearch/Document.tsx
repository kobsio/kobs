import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React, { useEffect, useRef } from 'react';
import { highlightBlock, registerLanguage } from 'highlight.js';
import json from 'highlight.js/lib/languages/json';

import 'highlight.js/styles/nord.css';

import { IDocument, formatTimeWrapper } from 'components/datasources/elasticsearch/helpers';
import Title from 'components/shared/Title';

registerLanguage('json', json);

export interface IDocumentProps {
  document: IDocument;
  close: () => void;
}

// Document renders a single document in a drawer panel. We show the whole JSON representation for this document in a
// code view. The highlighting of this JSON document is handled by highlight.js.
const Document: React.FunctionComponent<IDocumentProps> = ({ document, close }: IDocumentProps) => {
  const code = useRef<HTMLElement>(null);

  // useEffect apply the highlighting to the given JSON document.
  useEffect(() => {
    if (code.current) {
      highlightBlock(code.current);
    }
  });

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={formatTimeWrapper(document['_source']['@timestamp'])}
          subtitle={`${document['_id']} (${document['_index']})`}
          size="lg"
        />
        <DrawerActions className="kobs-drawer-actions">
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobs-drawer-panel-body">
        <pre className="pf-u-pb-md">
          <code ref={code}>{JSON.stringify(document, null, 2)}</code>
        </pre>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Document;
