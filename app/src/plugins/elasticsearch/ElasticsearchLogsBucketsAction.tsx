import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface IElasticsearchLogsBucketsActionProps {
  name: string;
  fields: string[];
  query: string;
  timeEnd: number;
  timeStart: number;
}

// ElasticsearchLogsBucketsAction is a dropdown component, which provides various actions for an Elasticsearch query.
// For example it can be used to display a link for the query, which will redirect the user to the page of the
// Elasticsearch plugin.
const ElasticsearchLogsBucketsAction: React.FunctionComponent<IElasticsearchLogsBucketsActionProps> = ({
  name,
  fields,
  query,
  timeEnd,
  timeStart,
}: IElasticsearchLogsBucketsActionProps) => {
  const [show, setShow] = useState<boolean>(false);
  const fieldParameters = fields.map((field) => `&field=${field}`);

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
              to={`/plugins/${name}?query=${query}${
                fieldParameters.length > 0 ? fieldParameters.join('') : ''
              }&timeEnd=${timeEnd}&timeStart=${timeStart}`}
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

export default ElasticsearchLogsBucketsAction;
