import MonacoEditorReact, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { FunctionComponent } from 'react';

import { setupMonaco } from './monaco';
import { nordTheme } from './themes';

setupMonaco();

interface IEditorProps {
  language: 'yaml' | 'json';
  lineNumbers: boolean;
  minimap: boolean;
  onChange?: (value: string | undefined) => void;
  readOnly: boolean;
  value: string;
}

/**
 * The `Editor` component wraps the monaco editor, so that we can apply some default settings which should always be
 * used in our app.
 */
export const Editor: FunctionComponent<IEditorProps> = ({
  language,
  readOnly,
  minimap,
  lineNumbers,
  value,
  onChange,
}) => {
  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('nord', nordTheme);
  };

  const handleOnMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    // At the moment we do not have to sth. here.
  };

  return (
    <MonacoEditorReact
      theme="nord"
      height="100%"
      defaultLanguage={language}
      defaultValue={value}
      beforeMount={handleBeforeMount}
      onMount={handleOnMount}
      onChange={onChange}
      options={{
        lineNumbers: lineNumbers ? 'on' : 'off',
        minimap: {
          enabled: minimap,
        },
        readOnly: readOnly,
        scrollBeyondLastLine: false,
      }}
    />
  );
};
