import { LabelProps } from '@patternfly/react-core';

import { IProcess, IProcessColors, ITrace } from './interfaces';

const COLOR_SCALE: LabelProps['color'][] = ['blue', 'cyan', 'green', 'orange', 'purple', 'red'];

const getColor = (index: number): LabelProps['color'] => {
  return COLOR_SCALE[index % COLOR_SCALE.length];
};

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
      return processes[process].color || 'blue';
    }
  }

  return 'blue';
};

export const getColorValue = (labelColor?: LabelProps['color']): string => {
  switch (labelColor) {
    case 'blue':
      return 'var(--pf-global--palette--blue-300)';
    case 'cyan':
      return 'var(--pf-global--palette--cyan-300)';
    case 'green':
      return 'var(--pf-global--palette--green-300)';
    case 'orange':
      return 'var(--pf-global--palette--gold-300)';
    case 'purple':
      return 'var(--pf-global--palette--purple-300)';
    case 'red':
      return 'var(--pf-global--palette--red-100)';
    default:
      return 'var(--pf-global--palette--blue-300)';
  }
};
