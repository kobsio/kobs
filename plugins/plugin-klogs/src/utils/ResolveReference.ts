import React from 'react';

import { IField } from './interfaces';

interface IResolveReference {
  getReferenceForField: (field: string, value: string) => string | undefined;
}
const Context = React.createContext<IResolveReference>({
  getReferenceForField: () => undefined,
});

type IFactory = (fields: IField[], times: { timeStart: number; timeEnd: number }) => IResolveReference;

interface IAutolink {
  fieldName: string;
  path: string;
}

const Factory: IFactory = (fields, times) => {
  const autolinks = fields.reduce<IAutolink[]>((acc, curr) => {
    const { autolinkPath } = curr;
    if (typeof autolinkPath == 'undefined') {
      return acc;
    }

    return [...acc, { fieldName: curr.name, path: autolinkPath }];
  }, []);

  return {
    getReferenceForField: (field: string, value: string): string | undefined => {
      let { path } = autolinks.find(({ fieldName }) => fieldName === field) || {};
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
