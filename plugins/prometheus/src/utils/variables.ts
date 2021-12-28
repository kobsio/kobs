import { IDashboardVariableValues, IPluginTimes, interpolate } from '@kobsio/plugin-core';

export const variables = async (
  variable: IDashboardVariableValues,
  variables: IDashboardVariableValues[],
  times: IPluginTimes,
): Promise<IDashboardVariableValues> => {
  try {
    const response = await fetch(`/api/plugins/prometheus/${variable.plugin.name}/variable`, {
      body: JSON.stringify({
        label: variable.plugin.options.label,
        query: interpolate(variable.plugin.options.query, variables, times),
        timeEnd: times.timeEnd,
        timeStart: times.timeStart,
        type: variable.plugin.options.type,
      }),
      method: 'post',
    });
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
