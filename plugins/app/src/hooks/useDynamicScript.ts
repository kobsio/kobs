import { useEffect, useState } from 'react';

const loadedScripts: Record<string, Promise<void>> = {};

export type ScriptStatus = { isFailed: boolean; isReady: boolean };

/**
 * Load a kobs specific federated module from a remote server.
 * @param name the plugin name aka. federated module name
 * @param version version of the module. Used as cache buster for CDNs.
 *                Note: the version can't be changed during runtime.
 * @returns the status of the script/module
 */
export const useDynamicScript = (name: string, version: string): ScriptStatus => {
  const url =
    process.env.NODE_ENV === 'production'
      ? `/plugins/${name}/remoteEntry.js?version=${version}`
      : `http://localhost:3001/remoteEntry.js?version=${version}`;

  return useScript(name, url);
};

/**
 * Load any javascript file from a remote server and execute it in the DOM.
 * @param name a unique name of the script so that it's only loaded once
 * @param url the URL where the script is located
 * @returns the status of the script
 */
export const useScript = (name: string, url: string): ScriptStatus => {
  const [isReady, setReady] = useState(false);
  const [isFailed, setFailed] = useState(false);

  const setLoading = (): void => {
    setReady(false);
    setFailed(false);
  };

  const setSuccess = (): void => {
    setReady(true);
    setFailed(false);
  };

  const setError = (): void => {
    setReady(false);
    setFailed(true);
  };

  useEffect(() => {
    if (!name) {
      return;
    }

    if (name in loadedScripts) {
      loadedScripts[name]
        .then(() => {
          setSuccess();
        })
        .catch(() => {
          setError();
        });
      return;
    }

    const element = document.createElement('script');

    loadedScripts[name] = new Promise<void>((resolve, reject) => {
      element.src = url;
      element.type = 'text/javascript';
      element.async = true;

      setLoading();

      element.onload = (): void => {
        setSuccess();
        resolve();
      };

      element.onerror = (): void => {
        setError();
        reject();
      };

      document.head.appendChild(element);
    });

    // return () => {
    //   document.head.removeChild(element);
    // };
  }, [name, url]);

  return {
    isFailed,
    isReady,
  };
};
