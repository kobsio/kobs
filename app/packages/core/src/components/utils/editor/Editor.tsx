import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { bracketMatching, syntaxHighlighting, foldGutter, StreamLanguage } from '@codemirror/language';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { EditorState, Extension, Prec } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  highlightSpecialChars,
  highlightActiveLine,
  rectangularSelection,
  lineNumbers,
  highlightActiveLineGutter,
  dropCursor,
  crosshairCursor,
  keymap,
} from '@codemirror/view';
import { InputBaseComponentProps, TextField, useTheme } from '@mui/material';
import { forwardRef, FunctionComponent, ReactNode, useEffect, useRef } from 'react';

import { createHighlighter, createTheme } from './theme';

import { useLatest } from '../../../utils/hooks/useLatest';

/**
 * `getLanguageExtensions` returns the extensions for the given language. If the provided language is a list of
 * extensions these extensions are returned. If the provided language is a string the defined extensions are returned.
 */
const getLanguageExtensions = (language: string | Extension[]): Extension[] => {
  switch (language) {
    case 'json':
      return [json()];
    case 'yaml':
      return [StreamLanguage.define(yaml)];
    default:
      return typeof language === 'string' ? [] : language;
  }
};

/**
 * The `CodeMirrorEditor` component implements the CodeMirror editor, which can be used to provide autocompletion and
 * syntax highlighting within the app.
 */
const CodeMirrorEditor: FunctionComponent<{
  handleSubmit?: () => void;
  language: string | Extension[];
  minimal: boolean;
  onChange?: (value: string) => void;
  value: string;
}> = ({ language, minimal, value, onChange, handleSubmit }) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const handleSubmitRef = useLatest(handleSubmit);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null) {
      if (!containerRef.current) {
        throw new Error('expected CodeMirror container element to exist');
      }

      const startState = EditorState.create({
        doc: value,
        extensions: [
          createTheme(theme, minimal),
          syntaxHighlighting(createHighlighter(theme)),
          highlightSpecialChars(),
          bracketMatching(),
          closeBrackets(),
          history(),
          autocompletion(),

          minimal
            ? []
            : [
                lineNumbers(),
                highlightActiveLine(),
                highlightActiveLineGutter(),
                foldGutter(),
                rectangularSelection(),
                dropCursor(),
                crosshairCursor(),
              ],

          EditorView.lineWrapping,
          onChange ? EditorState.readOnly.of(false) : EditorState.readOnly.of(true),
          EditorView.updateListener.of((update: ViewUpdate): void => {
            if (update.docChanged && onChange) {
              onChange(update.state.doc.toString());
            }
          }),

          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap]),
          Prec.highest(
            keymap.of([
              {
                key: 'Shift-Enter',
                run: (v: EditorView): boolean => {
                  if (handleSubmit && handleSubmitRef.current) {
                    handleSubmitRef.current();
                  }
                  return true;
                },
              },
            ]),
          ),

          ...getLanguageExtensions(language),
        ],
      });

      const view = new EditorView({
        parent: containerRef.current,
        state: startState,
      });

      viewRef.current = view;

      view.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view !== null && view.state.doc.toString() !== value) {
      view.dispatch(
        view.state.update({
          changes: { from: 0, insert: value, to: view.state.doc.length },
        }),
      );
    }
  }, [value]);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
      ref={containerRef}
    />
  );
};

const InternalEditor = forwardRef<HTMLInputElement, InputBaseComponentProps>(function Editor(props, ref) {
  const { language, minimal, value, onChange, handleSubmit } = props;

  const handleOnChange = (value: string | undefined) => {
    if (onChange) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onChange({ target: { value: value ?? '' } });
    }
  };

  return (
    <CodeMirrorEditor
      language={language}
      minimal={minimal}
      value={value}
      onChange={handleOnChange}
      handleSubmit={handleSubmit}
    />
  );
});

/**
 * The `Editor` component can be used within our app to have a code editor with autocompletion and syntax highlighting.
 * The editor is a normal MUI TextField with the CodeMirror editor as input component.
 */
export const Editor: FunctionComponent<{
  adornment?: ReactNode;
  handleSubmit?: () => void;
  language: string | Extension[];
  minimal?: boolean;
  onChange?: (value: string) => void;
  value: string;
}> = ({ adornment, language, minimal = false, value, onChange, handleSubmit }) => {
  return (
    <TextField
      sx={{
        '.MuiInputBase-root': {
          height: '100%',
          width: '100%',
        },
        height: '100%',
        width: '100%',
      }}
      fullWidth={true}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      InputProps={{
        endAdornment: adornment,
        inputComponent: InternalEditor,
        inputProps: {
          handleSubmit: handleSubmit,
          language: language,
          minimal: minimal,
        },
      }}
    />
  );
};
