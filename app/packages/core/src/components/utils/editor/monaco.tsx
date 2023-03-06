import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { setDiagnosticsOptions } from 'monaco-yaml';

import yamlWorker from './yaml.worker.js?worker';

/**
 * `setupMonaco` is used to setup monaco, which is used in various places of the app, e.g. to show and edit yaml files
 * of Kubernetes resources or to provide autocompletion in plugins for the query language of a service (e.g. PromQL for
 * the Prometheus Plugin).
 */
export const setupMonaco = () => {
  // eslint-disable-next-line no-restricted-globals
  self.MonacoEnvironment = {
    getWorker(_, label) {
      switch (label) {
        case 'editorWorkerService':
          return new editorWorker();
        case 'json':
          return new jsonWorker();
        case 'yaml':
          return new yamlWorker();
        default:
          throw new Error(`Unknown label ${label}`);
      }
    },
  };

  loader.config({ monaco });

  loader.init().then(() => {
    // Initialized
  });

  setDiagnosticsOptions({
    completion: true,
    enableSchemaRequest: true,
    format: true,
    hover: true,
    validate: true,
  });
};
