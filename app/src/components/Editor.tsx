import React, { useRef } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-nord_dark';

// IEditorProps is the interface for the Editor props. The editor requires a value, which is shown in the Editor field,
// a mode, which defines the language. If the editor isn't set to read only the user can also pass in a onChange
// function to retrieve the changes from the editor.
interface IEditorProps {
  value: string;
  mode: string;
  readOnly: boolean;
  onChange?: (newValue: string) => void;
}

// Editor is the editor component, which can be used to show for example the yaml representation of a resource.
const Editor: React.FunctionComponent<IEditorProps> = ({ value, mode, readOnly, onChange }: IEditorProps) => {
  const editor = useRef<AceEditor>(null);

  const changeValue = (newValue: string): void => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <AceEditor
      height="100%"
      maxLines={Infinity}
      mode={mode}
      name="yaml-editor"
      onChange={changeValue}
      readOnly={readOnly}
      ref={editor}
      setOptions={{
        useSoftTabs: true,
      }}
      showPrintMargin={false}
      tabSize={2}
      theme="nord_dark"
      value={value}
      width="100%"
    />
  );
};

export default Editor;
