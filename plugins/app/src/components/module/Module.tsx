import React, { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useDynamicScript } from '../../hooks/useDynamicScript';

// wait can be used to simulate long loading times in the "loadComponent" function.
// const wait = async (): Promise<void> => {
//   await new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('done');
//     }, 5000);
//   });
//   return;
// };

const loadComponent = (scope: string, module: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (): Promise<any> => {
    // wait can be used to simulate long loading times
    // await wait();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await __webpack_init_sharing__('default');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const container = window[scope];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
};

declare function errorContentRenderer(props: {
  title: string;
  children: React.ReactElement;
}): React.ReactElement<unknown, string | React.FunctionComponent | typeof React.Component> | null;

export interface IModuleProps {
  version: string;
  name: string;
  module: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
  loadingContent: React.FunctionComponent;
  errorContent: typeof errorContentRenderer;
}

const Module: React.FunctionComponent<IModuleProps> = ({
  version,
  name,
  module,
  props,
  errorContent,
  loadingContent,
}: IModuleProps) => {
  const { ready, failed } = useDynamicScript(name, version);

  const ErrorContent = errorContent;
  const LoadingContent = loadingContent;

  if (!name || !module) {
    return (
      <ErrorContent title="Invalid usage of the Module component">
        <p>
          <b>name</b> and <b>module</b> property is required, but not provided
        </p>
      </ErrorContent>
    );
  }

  if (!ready) {
    return <LoadingContent />;
  }

  if (failed) {
    return (
      <ErrorContent title="Failed to load module">
        <p>
          Could not load module <b>{module}</b> from <b>{name}</b>
        </p>
      </ErrorContent>
    );
  }

  const Component = React.lazy(loadComponent(name, module));

  return (
    <ErrorBoundary
      fallbackRender={({ error }): React.ReactElement => (
        <ErrorContent title="Failed to load module">
          <p>{error.message}</p>
        </ErrorContent>
      )}
    >
      <React.Suspense fallback={<LoadingContent />}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default memo(Module, (prevProps, nextProps) => {
  if (prevProps.module === nextProps.module && prevProps.name === nextProps.name) {
    if (JSON.stringify(prevProps.props) === JSON.stringify(nextProps.props)) {
      return true;
    }
  }

  return false;
});
