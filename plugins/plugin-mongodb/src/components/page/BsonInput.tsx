import React, { useRef } from 'react';
import { Ace } from 'ace-builds';
import AceEditor from 'react-ace';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import { mongoOperatorCompletions, mongoTypesCompletions } from '../../utils/mongo-completions';

interface IBsonInputProps {
  onInputChange: (data: string) => void;
  data: string;
}

const BsonInput: React.FunctionComponent<IBsonInputProps> = ({ onInputChange, data }: IBsonInputProps) => {
  const editor = useRef<AceEditor>(null);

  React.useEffect(() => {
    const mongoCompleter = {
      getCompletions: (
        editor: Ace.Editor,
        session: Ace.EditSession,
        pos: Ace.Point,
        prefix: string,
        callback: Ace.CompleterCallback,
      ): void => {
        callback(null, [...mongoTypesCompletions, ...mongoOperatorCompletions]);
      },
    };

    if (editor.current) {
      addCompleter(mongoCompleter);
      editor.current.editor.completers = [mongoCompleter];
    }
  }, []);

  const changeValue = (newValue: string): void => {
    onInputChange(newValue);
  };

  return (
    <AceEditor
      height="100%"
      maxLines={Infinity}
      mode="javascript"
      name="query-editor"
      onChange={changeValue}
      readOnly={false}
      ref={editor}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useSoftTabs: true,
      }}
      showPrintMargin={false}
      tabSize={2}
      theme="github"
      value={data}
      width="100%"
      fontSize={'var(--pf-global--FontSize--md)'}
    />
  );
};

export default BsonInput;
