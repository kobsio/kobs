import MonacoEditorReact, { Monaco } from '@monaco-editor/react';
import { Box } from '@mui/material';
import * as monaco from 'monaco-editor';
import { FunctionComponent, useState } from 'react';

import { setupPromQL, setupMonaco, setupMongoDB, setupSignalSciences } from './monaco';
import { muiTheme, nordTheme } from './themes';

import { useLatest } from '../../../utils/hooks/useLatest';

setupMonaco();

/**
 * `IEditorProps` is the interface for the `Editor` component and the `MUIEditor` component.
 */
interface IEditorProps {
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  value: string;
}

/**
 * The `Editor` component wraps the monaco editor, so that we can apply some default settings which should always be
 * used in our app.
 */
export const Editor: FunctionComponent<IEditorProps> = ({ language, readOnly = false, value, onChange }) => {
  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('nord', nordTheme);
  };

  const handleOnMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.addCommand(monaco.KeyCode.F1, () => {
      // Disable command pallete, by "stealing" its keybindings.
      // See: https://github.com/microsoft/monaco-editor/issues/419
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      // Since the find action is "disabled" in the `MUIEditor` component we have to re-add the command here. If we
      // wouldn't do this the find action would not work in the `Editor` component, after a user used the `MUIEditor`
      // component.
      editor.getAction('actions.find')?.run();
    });
  };

  return (
    <MonacoEditorReact
      theme="nord"
      height="100%"
      language={language}
      value={value}
      beforeMount={handleBeforeMount}
      onMount={handleOnMount}
      onChange={onChange}
      options={{
        fontFamily: 'monospace',
        readOnly: readOnly,
        scrollBeyondLastLine: false,
      }}
    />
  );
};

/**
 * `IMUIEditorProps` is the interface for the `MUIEditor` component which extends the `IEditorProps` interface with some
 * additional functions.
 */
interface IMUIEditorProps extends IEditorProps {
  callSubmit?: () => void;
  loadCompletionItems?: () => Promise<string[]>;
}

/**
 * The `MUIEditor` component wraps the monaco editor, similar to the `Editor` component, but applies the MUI theme we
 * are using, so that the editor looks like a `TextField` component. The `MUIEditor` also adds support for the languages
 * we are using (e.g. PromQL).
 *
 * The `MUIEditor` also allows us to add some special features to monaco, so that it is possible to load custom
 * completion items via the passed in `loadCompletionItems` function and to submit a form via the `Shift + Enter` by
 * calling the provided `callSubmit` function.
 */
export const MUIEditor: FunctionComponent<IMUIEditorProps> = ({
  language,
  readOnly = false,
  loadCompletionItems,
  callSubmit,
  value,
  onChange,
}) => {
  const callSubmitRef = useLatest(callSubmit);
  const [height, setHeight] = useState(36);

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('mui', muiTheme);

    switch (language) {
      case 'mongodb':
        setupMongoDB(monaco, loadCompletionItems);
        break;
      case 'promql':
        setupPromQL(monaco, loadCompletionItems);
        break;
      case 'signalsciences':
        setupSignalSciences(monaco, loadCompletionItems);
        break;
      default:
        break;
    }
  };

  const handleOnMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.onDidContentSizeChange(() => {
      const newHeight = Math.min(1000, editor.getContentHeight());
      setHeight(newHeight < 36 ? 36 : newHeight);
    });

    editor.addCommand(monaco.KeyCode.F1, () => {
      // Disable command pallete, by "stealing" its keybindings.
      // See: https://github.com/microsoft/monaco-editor/issues/419
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      // Disable find, by "stealing" its keybindings.
    });

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (callSubmitRef.current) {
        callSubmitRef.current();
      }
    });
  };

  return (
    <Box
      sx={{
        '.kobsio-monaco-editor': {
          height: '100%',
          position: 'absolute',
          width: '100%',
        },

        height: '100%',
        position: 'relative',
        width: '100%',
      }}
    >
      <MonacoEditorReact
        theme="mui"
        height={height}
        language={language}
        value={value}
        beforeMount={handleBeforeMount}
        onMount={handleOnMount}
        onChange={onChange}
        className="kobsio-monaco-editor"
        options={{
          contextmenu: false,
          cursorWidth: 1,
          folding: false,
          fontFamily: 'monospace',
          fontSize: 13,
          glyphMargin: false,
          lineDecorationsWidth: 12,
          lineHeight: 18.6875,
          lineNumbers: 'off',
          lineNumbersMinChars: 0,
          minimap: {
            enabled: false,
          },
          overviewRulerLanes: 0,
          padding: { bottom: 8.5, top: 8.5 },
          readOnly: readOnly,
          renderLineHighlight: 'none',
          scrollBeyondLastLine: false,
          scrollbar: {
            handleMouseWheel: false,
            horizontal: 'hidden',
            vertical: 'hidden',
          },
          wordWrap: 'on',
        }}
      />
    </Box>
  );
};
