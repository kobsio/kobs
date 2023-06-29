import yaml from 'js-yaml';
import { JSONPath } from 'jsonpath-plus';

import { APIClient } from '../../context/APIContext';
import { IVariableValues } from '../../crds/dashboard';
import { ITimes } from '../../utils/times';

/**
 * `interpolate` will interpolate the `variables` in the provided `str` with their current value. The variables in the
 * string must have the form `{% .variableName %}`. If the variable was provided via a placeholder we also have to check
 * the type of the value to remove the surrounding `"` in the string. The is required because the provided str should be
 * a stringified JSON document. The special variables `{% .__timeStart %}` and `{% .__timeEnd %}` will be replaced with
 * the provided start and end time from the `times` parameter.
 */
export const interpolate = (
  str: string,
  variables: IVariableValues[],
  times: ITimes,
  interpolator: string[] = ['{%', '%}'],
): string => {
  for (const variable of variables) {
    if (variable.plugin.type === 'core' && variable.plugin.name === 'placeholder') {
      if (variable.plugin.options && variable.plugin.options.type && variable.plugin.options.type === 'number') {
        str = str.replaceAll(`"${interpolator[0]} .${variable.name} ${interpolator[1]}"`, variable.value);
      } else if (
        variable.plugin.options &&
        variable.plugin.options.type &&
        variable.plugin.options.type === 'object' &&
        variable.value
      ) {
        str = str.replaceAll(
          `"${interpolator[0]} .${variable.name} ${interpolator[1]}"`,
          JSON.stringify(yaml.load(variable.value)),
        );
      } else {
        str = str.replaceAll(`${interpolator[0]} .${variable.name} ${interpolator[1]}`, variable.value);
      }
    } else {
      str = str.replaceAll(`${interpolator[0]} .${variable.name} ${interpolator[1]}`, variable.value);
    }
  }

  str = str.replaceAll(`${interpolator[0]} .__timeStart ${interpolator[1]}`, `${times.timeStart}`);
  str = str.replaceAll(`${interpolator[0]} .__timeEnd ${interpolator[1]}`, `${times.timeEnd}`);

  return str;
};

/**
 * `interpolateJSONPath` allows us to replace a value in the provided `str` with the value from the provided `manifest`
 * via JSONPath. The function will check if the `str` contains a value wrapped by the provided `interpolator`. If this
 * is the case it will use the JSONPath between the interpolators with the corresponding value from the provided
 * `manifest`.
 *
 * See: https://stackoverflow.com/a/57598892/4104109
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const interpolateJSONPath = (str: string, manifest: any, interpolator: string[] = ['<%', '%>']): string => {
  return str
    .split(interpolator[0])
    .map((s1, i) => {
      if (i === 0) {
        return s1;
      }

      const s2 = s1.split(interpolator[1]);
      if (s1 === s2[0]) {
        return interpolator[0] + s2[0];
      }

      if (s2.length > 1) {
        s2[0] = JSONPath({ json: manifest, path: s2[0].trim(), wrap: false });
      }

      return s2.join('');
    })
    .join('');
};

/**
 * `getVariableViaPlugin` returns the values for a variable which doesn't use one of the core plugins (e.g. Prometheus).
 * To get the values we have to call the variables endpoint of the plugin with the provided plugin options as body. If
 * the `includeAllOption` option is set to true, we also add a value which contains a joined string of all other values.
 */
export const getVariableViaPlugin = async (
  apiClient: APIClient,
  variable: IVariableValues,
  times: ITimes,
): Promise<IVariableValues> => {
  const result = await apiClient.post<string[]>(
    `/api/plugins/${variable.plugin.type}/variable?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
    {
      body: variable.plugin.options,
      headers: {
        'x-kobs-cluster': variable.plugin.cluster,
        'x-kobs-plugin': variable.plugin.name,
      },
    },
  );

  if (result && Array.isArray(result) && result.length > 0) {
    if (result && result.length > 1 && variable.includeAllOption) {
      result.unshift(result.join('|'));
    }

    return {
      ...variable,
      value: result && result.includes(variable.value) ? variable.value : result ? result[0] : '',
      values: result ? result : [''],
    };
  } else {
    return { ...variable, value: '', values: [''] };
  }
};
