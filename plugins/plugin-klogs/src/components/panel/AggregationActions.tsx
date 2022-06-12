import { CardActions, Dropdown, DropdownItem, KebabToggle, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { IAggregationOptions } from '../../utils/interfaces';

interface IAggregationActionsProps {
  instance: IPluginInstance;
  isFetching: boolean;
  options: IAggregationOptions;
}

export const AggregationActions: React.FunctionComponent<IAggregationActionsProps> = ({
  instance,
  isFetching,
  options,
}: IAggregationActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <CardActions>
      {isFetching ? (
        <Spinner size="md" />
      ) : (
        <Dropdown
          toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
          isOpen={show}
          isPlain={true}
          position="right"
          dropdownItems={[
            <DropdownItem
              key={0}
              component={
                <Link
                  to={`${pluginBasePath(instance)}/aggregation?time=${options.times.time}&timeEnd=${
                    options.times.timeEnd
                  }&timeStart=${options.times.timeStart}&chart=${options.chart}&query=${
                    options.query
                  }&aggregation=${encodeURIComponent(JSON.stringify(options.options))}`}
                >
                  Explore
                </Link>
              }
            />,
          ]}
        />
      )}
    </CardActions>
  );
};

export default AggregationActions;
