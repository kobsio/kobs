import { IPluginInstance } from '@kobsio/core';
import { FlamegraphRenderer, convertJaegerTraceToProfile } from '@pyroscope/flamegraph';
import { FunctionComponent } from 'react';

import '@pyroscope/flamegraph/dist/index.css';

import { ITrace } from '../utils/utils';

export const Flamegraph: FunctionComponent<{
  colors: Record<string, string>;
  instance: IPluginInstance;
  trace: ITrace;
}> = ({ instance, colors, trace }) => {
  const convertedProfile = convertJaegerTraceToProfile(trace);

  return (
    <FlamegraphRenderer
      colorMode="dark"
      profile={convertedProfile}
      showToolbar={false}
      showCredit={false}
      onlyDisplay="flamegraph"
    />
  );
};
