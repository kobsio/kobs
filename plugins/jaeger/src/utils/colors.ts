import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';

import { IProcess, IProcessColors, ITrace } from './interfaces';
import { getColor } from '@kobsio/plugin-core';

// addColorForProcesses add a color to each process in all the given traces. If a former trace already uses a process,
// with the same service name we reuse the former color.
export const addColorForProcesses = (traces: ITrace[]): ITrace[] => {
  const usedColors: IProcessColors = {};

  for (let i = 0; i < traces.length; i++) {
    const processes = Object.keys(traces[i].processes);

    for (let j = 0; j < processes.length; j++) {
      const process = processes[j];

      if (usedColors.hasOwnProperty(traces[i].processes[process].serviceName)) {
        traces[i].processes[process].color = usedColors[traces[i].processes[process].serviceName];
      } else {
        const color = getColor(j);
        usedColors[traces[i].processes[process].serviceName] = color;
        traces[i].processes[process].color = color;
      }
    }
  }

  return traces;
};

// getColorForService returns the correct color for a given service from the processes.
export const getColorForService = (processes: Record<string, IProcess>, serviceName: string): string => {
  for (const process in processes) {
    if (processes[process].serviceName === serviceName) {
      return processes[process].color || chart_color_blue_300.value;
    }
  }

  return chart_color_blue_300.value;
};
