import React from 'react';

const loadedScripts = {};

export const useDynamicScript = (
  name: string,
): {
  failed: boolean;
  ready: boolean;
} => {
  const url =
    process.env.NODE_ENV === 'production' ? `/plugins/${name}/remoteEntry.js` : 'http://localhost:3001/remoteEntry.js';

  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!name) {
      return;
    }

    if (name in loadedScripts) {
      return loadedScripts[name]
        .then(() => {
          setReady(true);
          setFailed(false);
        })
        .catch(() => {
          setReady(false);
          setFailed(true);
        });
    }

    const element = document.createElement('script');

    loadedScripts[name] = new Promise<void>((resolve, reject) => {
      element.src = url;
      element.type = 'text/javascript';
      element.async = true;

      setReady(false);
      setFailed(false);

      element.onload = (): void => {
        setReady(true);
        resolve();
      };

      element.onerror = (): void => {
        setReady(false);
        setFailed(true);
        reject();
      };

      document.head.appendChild(element);
    });

    // return () => {
    //   document.head.removeChild(element);
    // };
  }, [name, url]);

  return {
    failed,
    ready,
  };
};
