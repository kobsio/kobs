import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  completeFromList,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { sql, MySQL, PostgreSQL, StandardSQL } from '@codemirror/lang-sql';
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
import { PromQLExtension } from '@prometheus-io/codemirror-promql';
import { forwardRef, FunctionComponent, ReactNode, useEffect, useRef } from 'react';

import { Clickhouse } from './languages/clickhouse';
import { mongodb } from './languages/mongodb';
import { signalsciences } from './languages/signalsciences';
import { createHighlighter, createTheme } from './theme';

import { useLatest } from '../../../utils/hooks/useLatest';

const sqlDialectFromString = (v = '') => {
  switch (v) {
    case 'postgresql':
      return PostgreSQL;
    case 'mysql':
      return MySQL;
    case 'clickhouse':
      return Clickhouse;
    default:
      return StandardSQL;
  }
};

/**
 * `getLanguageExtensions` returns the extensions for the given language. If the provided language is a list of
 * extensions these extensions are returned. If the provided language is a string the defined extensions are returned.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLanguageExtensions = (language: string, languageOptions: any): Extension[] => {
  switch (language) {
    case 'json':
      return [json()];
    case 'klogs':
      return [
        autocompletion({
          override: [completeFromList(languageOptions.completions)],
        }),
      ];
    case 'mongodb':
      return [mongodb()];
    case 'promql':
      return [
        new PromQLExtension()
          .activateCompletion(true)
          .activateLinter(true)
          .setComplete({
            remote: {
              fetchFn: (input: RequestInfo, init?: RequestInit): Promise<Response> => {
                return fetch(input, {
                  ...init,
                  headers: {
                    'x-kobs-cluster': languageOptions.cluster,
                    'x-kobs-plugin': languageOptions.name,
                  },
                });
              },
              url: `/api/plugins/prometheus/proxy`,
            },
          })
          .asExtension(),
      ];
    case 'signalsciences':
      return [signalsciences()];
    case 'sql':
      return [sql({ dialect: sqlDialectFromString(languageOptions.dialect), schema: languageOptions.completions })];
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
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  languageOptions?: any;
  minimal: boolean;
  onChange?: (value: string) => void;
  readOnly: boolean;
  value: string;
}> = ({ language, languageOptions, minimal, readOnly, value, onChange, handleSubmit }) => {
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
          readOnly ? EditorState.readOnly.of(true) : EditorState.readOnly.of(false),
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

          ...getLanguageExtensions(language, languageOptions),
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
  const { language, languageOptions, minimal, readOnly, value, onChange, handleSubmit } = props;

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
      languageOptions={languageOptions}
      minimal={minimal}
      readOnly={readOnly}
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
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  languageOptions?: any;
  minimal?: boolean;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  value: string;
}> = ({ adornment, language, languageOptions, minimal = false, readOnly = false, value, onChange, handleSubmit }) => {
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
          languageOptions: languageOptions,
          minimal: minimal,
          readOnly: readOnly,
        },
      }}
    />
  );
};
