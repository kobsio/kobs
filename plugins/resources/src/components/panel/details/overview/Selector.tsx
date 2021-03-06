import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';
import { V1LabelSelector } from '@kubernetes/client-node';

interface ISelectorProps {
  cluster: string;
  namespace: string;
  selector: V1LabelSelector;
}

const Selector: React.FunctionComponent<ISelectorProps> = ({ cluster, namespace, selector }: ISelectorProps) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>Selector</DescriptionListTerm>
      <DescriptionListDescription>
        {selector.matchLabels &&
          Object.keys(selector.matchLabels).map((key) => (
            <Link
              key={key}
              to={`/resources?selector=${key}=${
                selector.matchLabels ? selector.matchLabels[key] : ''
              }&cluster=${cluster}&namespace=${namespace}&resource=pods`}
            >
              <div className="pf-c-chip pf-u-mr-md pf-u-mb-sm" style={{ maxWidth: '100%' }}>
                <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
                  {key}={selector.matchLabels ? selector.matchLabels[key] : ''}
                </span>
              </div>
            </Link>
          ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Selector;
