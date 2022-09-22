import React, { useRef } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import { toExtendedJson } from '../../utils/helpers';

interface IBsonPreviewProps {
  data: string;
}

const BsonPreview: React.FunctionComponent<IBsonPreviewProps> = ({ data }: IBsonPreviewProps) => {
  const renderDocument = (document: string): string => {
    try {
      return toExtendedJson(document);
    } catch (error) {
      return error.toString();
    }
  };

  const editor = useRef<AceEditor>(null);
  const documentLines = data.split(/\r\n|\r|\n/).length;

  return (
    <AceEditor
      height="100%"
      maxLines={documentLines > 5 ? documentLines : 5}
      mode="json"
      name="query-viewer"
      readOnly={true}
      ref={editor}
      setOptions={{
        useSoftTabs: true,
      }}
      showPrintMargin={false}
      tabSize={2}
      theme="github"
      value={renderDocument(data)}
      width="100%"
      fontSize={'var(--pf-global--FontSize--md)'}
    />
  );
};

export default BsonPreview;
