import { V1LabelSelector } from '@kubernetes/client-node';
import { Chip } from '@mui/material';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '../../utils/DescriptionList';

interface ISelectorProps {
  cluster: string;
  namespace: string;
  selector: V1LabelSelector;
}

const Selector: FunctionComponent<ISelectorProps> = ({ cluster, namespace, selector }: ISelectorProps) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Selector</DescriptionListTerm>
      <DescriptionListDescription>
        {selector.matchLabels &&
          Object.keys(selector.matchLabels).map((key) => (
            <Chip
              key={key}
              size="small"
              label={`${key}=${selector.matchLabels ? selector.matchLabels[key] : ''}`}
              clickable={true}
              component={Link}
              to={`/resources?paramName=labelSelector&param=${key}=${
                selector.matchLabels ? selector.matchLabels[key] : ''
              }&clusters[]=${cluster}&namespaces[]=${namespace}&resources[]=pods`}
            />
          ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Selector;
