import React from 'react';

interface IResolveReference {
  getReferenceForField: (field: string, value: string) => string | undefined;
}
const Context = React.createContext<IResolveReference>({
  getReferenceForField: () => undefined,
});

type IFactory = (
  fields: Array<{ fieldName: string; path: string }>,
  times: { timeStart: number; timeEnd: number },
) => IResolveReference;

const Factory: IFactory = (fields, times) => {
  return {
    getReferenceForField: (field: string, value: string): string | undefined => {
      let { path } = fields.find(({ fieldName }) => fieldName === field) || {};
      if (!path) {
        return;
      }

      path = path.replaceAll('<<value>>', value);
      path = path.replaceAll('<<timeEnd>>', `${times.timeEnd}`);
      path = path.replaceAll('<<timeStart>>', `${times.timeStart}`);

      return path;
    },
  };
};

export const AutolinkReference = {
  Context,
  Factory,
};
