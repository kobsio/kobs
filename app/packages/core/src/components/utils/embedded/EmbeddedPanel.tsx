import { FunctionComponent } from 'react';

import { GridContextProvider } from '../../../context/GridContext';
import { ITimes } from '../../../utils/times';
import { PluginPanel } from '../../plugins/PluginPanel';

export const EmbeddedPanel: FunctionComponent<{
  cluster: string;
  description?: string;
  name: string;
  options?: unknown;
  setTimes: (times: ITimes) => void;
  times: ITimes;
  title: string;
  type: string;
}> = ({ title, description, cluster, type, name, options, times, setTimes }) => {
  return (
    <GridContextProvider autoHeight={true}>
      <PluginPanel
        cluster={cluster}
        description={description}
        name={name}
        options={options}
        title={title}
        type={type}
        times={times}
        setTimes={setTimes}
      />
    </GridContextProvider>
  );
};
