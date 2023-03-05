/**
 * This file is required to fix the following error:
 * ```
 * Uncaught (in promise) Error: Unexpected usage
 * at EditorSimpleWorker.loadForeignModule (editorSimpleWorker.js)
 * at webWorker.js
 * ```
 *
 * See: https://github.com/remcohaszing/monaco-yaml#why-doesnt-it-work-with-vite
 */
import 'monaco-yaml/yaml.worker.js';
