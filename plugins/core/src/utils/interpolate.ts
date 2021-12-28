import { IDashboardVariableValues } from '../crds/dashboard';
import { IPluginTimes } from '../context/PluginsContext';

// IVariables is a map of variable names with the current value. This interface should only be used by the interpolate
// function, to convert a given array of variables to the format, which is required by the function.
interface IVariables {
  [key: string]: string;
}

// interpolate is used to replace the variables in a given string with the current value for this variable. Before we
// can replace the variables in a string we have to convert the array of variables to a map of variable names and there
// value.
// The default interpolator/delimiter is "{%" and "%}", so that it doesn't conflict with the delimiter used for the
// placeholder. We can not use the same, because the are replaced at different points in our app logic.
// See: https://stackoverflow.com/a/57598892/4104109
export const interpolate = (
  str: string,
  variables: IDashboardVariableValues[],
  times: IPluginTimes,
  interpolator: string[] = ['{%', '%}'],
): string => {
  const vars: IVariables = {};

  for (const variable of variables) {
    vars[variable.name] = variable.value;
  }

  vars['__timeStart'] = `${times.timeStart}`;
  vars['__timeEnd'] = `${times.timeEnd}`;

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
        s2[0] =
          s2[0] && vars.hasOwnProperty(s2[0].trim().substring(1))
            ? vars[s2[0].trim().substring(1)]
            : interpolator.join(` ${s2[0]} `);
      }

      return s2.join('');
    })
    .join('');
};
