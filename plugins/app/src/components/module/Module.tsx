import React, { ComponentProps, ComponentType, ReactElement, memo } from 'react';
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

/**
 * Load and initialize a federated module via webpack container.
 * @param scope the module scope. In kobs it's usually the plugin name: e.g. 'kiali'
 * @param module the name of the module entry point. e.g. './Page'
 * @returns the module component or method
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadComponent = <T extends ComponentType<any>>(
  scope: string,
  module: string,
): (() => Promise<{ default: T }>) => {
  return async (): Promise<{ default: T }> => {
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
    const ModuleInstance = factory();
    return ModuleInstance;
  };
};

declare function errorContentRenderer(props: {
  title: string;
  children: React.ReactElement;
}): React.ReactElement<unknown, string | React.FunctionComponent | typeof React.Component> | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IModuleProps<P = any> {
  version: string;
  name: string;
  module: string;
  props: P;
  loadingContent: React.FunctionComponent;
  errorContent: typeof errorContentRenderer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Module = <M extends ComponentType<any>, P extends ComponentProps<M>>({
  version,
  name,
  module,
  props,
  errorContent,
  loadingContent,
}: IModuleProps<P>): ReactElement => {
  const { isReady, isFailed } = useDynamicScript(name, version);

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

  if (isFailed) {
    return (
      <ErrorContent title="Failed to load module">
        <p>
          Could not load module <b>{module}</b> from <b>{name}</b>
        </p>
      </ErrorContent>
    );
  }

  if (!isReady) {
    return <LoadingContent />;
  }

  const Component = React.lazy(loadComponent<M>(name, module));

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
