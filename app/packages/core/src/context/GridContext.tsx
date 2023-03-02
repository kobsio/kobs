import { createContext, FunctionComponent, ReactNode } from 'react';

/**
 * `IGridContext` is the interface which must be implemented by the `GridContext`. The grid context just contains a
 * boolean named `autoHeight`.
 */
export interface IGridContext {
  autoHeight: boolean;
}

/**
 * `GridContext` is the context to manage the layout of a grid in a dashboard. For that it contains a `autoHeight` value
 * which is set be set to `true` or `false` in a row on a dashboard. The context can then be used to style the panels
 * based on the `autoHeight` value of each row.
 */
export const GridContext = createContext<IGridContext>({
  autoHeight: false,
});

/**
 * `GridContextConsumer` is a React component that subscribes to all changes in the grid context. This let us
 * subscribe to the context within a function component.
 */
export const GridContextConsumer = GridContext.Consumer;

/**
 * `IGridContextProviderProps` is the interface for the `GridContextProvider` component. To initialize the context
 * we have to pass a `autoHeight` to the component. All the provided `children` can then subscribe to the context.
 */
interface IGridContextProviderProps {
  autoHeight: boolean;
  children: ReactNode;
}

/**
 * `GridContextProvider` is a provider component that allows us comsuming components to subscribe to the context
 * changes.
 */
export const GridContextProvider: FunctionComponent<IGridContextProviderProps> = ({
  autoHeight,
  children,
}: IGridContextProviderProps) => {
  return (
    <GridContext.Provider
      value={{
        autoHeight: autoHeight,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};
