import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ITimes } from 'plugins/prometheus/helpers';

interface IPrometheusChartActionsProps {
  name: string;
  times: ITimes;
  interpolatedQueries: string[];
}

// PrometheusChartActions is a dropdown component, which provides various actions for a chart. For example it can be
// used to display a link for each query in the chart. When the user click on the link, he will be redirected to the
// corresponding datasource page, with the query and time data prefilled.
const PrometheusChartActions: React.FunctionComponent<IPrometheusChartActionsProps> = ({
  name,
  times,
  interpolatedQueries,
}: IPrometheusChartActionsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const queries = interpolatedQueries.map((query) => `&query=${query}`);

  return (
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
              to={`/plugins/${name}?&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}${
                queries.length > 0 ? queries.join('') : ''
              }`}
              target="_blank"
            >
              Explore
            </Link>
          }
        />,
      ]}
    />
  );
};

export default PrometheusChartActions;
