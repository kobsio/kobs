import { ITimes } from '@kobsio/shared';
import { IVariableValues } from '../../../crds/dashboard';
import { interpolate } from './interpolate';

export const getVariableViaPlugin = async (
  variable: IVariableValues,
  variables: IVariableValues[],
  times: ITimes,
): Promise<IVariableValues> => {
  try {
    const response = await fetch(
      `/api/plugins/${variable.plugin.type}/variable?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
      {
        body: interpolate(JSON.stringify(variable.plugin.options), variables, times),
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': variable.plugin.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': variable.plugin.satellite,
        },
        method: 'post',
      },
    );
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      if (json && Array.isArray(json) && json.length > 0) {
        if (json && json.length > 1 && variable.plugin.options.allowAll) {
          json.unshift(json.join('|'));
        }

        return {
          ...variable,
          value: json && json.includes(variable.value) ? variable.value : json ? json[0] : '',
          values: json ? json : [''],
        };
      } else {
        return { ...variable, value: '', values: [''] };
      }
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  } catch (err) {
    throw err;
  }
};
