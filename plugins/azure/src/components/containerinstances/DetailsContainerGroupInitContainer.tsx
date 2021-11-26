import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { ExpandableRowContent, TableComposable, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';

import DetailsContainerGroupEvent from './DetailsContainerGroupEvent';
import { IInitContainer } from './interfaces';

interface IDetailsContainerGroupInitContainerProps {
  initContainer: IInitContainer;
}

const DetailsContainerGroupInitContainer: React.FunctionComponent<IDetailsContainerGroupInitContainerProps> = ({
  initContainer,
}: IDetailsContainerGroupInitContainerProps) => {
  const [isExpanded, setIsExpaned] = useState<boolean>(false);

  return (
    <React.Fragment>
      <Tr onClick={(): void => setIsExpaned(!isExpanded)}>
        <Td dataLabel="Name">{initContainer.name}</Td>
        <Td dataLabel="Restarts">{initContainer.properties?.instanceView?.restartCount || '-'}</Td>
        <Td dataLabel="Current State">{initContainer.properties?.instanceView?.currentState?.state || '-'}</Td>
        <Td dataLabel="Previous State">{initContainer.properties?.instanceView?.previousState?.state || '-'}</Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={10}>
          <ExpandableRowContent>
            <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
              {initContainer.properties?.image && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Image</DescriptionListTerm>
                  <DescriptionListDescription>{initContainer.properties?.image}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {initContainer.properties?.command && initContainer.properties?.command.length > 0 && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Command</DescriptionListTerm>
                  <DescriptionListDescription>{initContainer.properties.command.join(' ')}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {initContainer.properties?.environmentVariables && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Environment</DescriptionListTerm>
                  <DescriptionListDescription>
                    {initContainer.properties?.environmentVariables?.map((env, index) => (
                      <div key={index}>
                        {env.name}:
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                          {env.value ? env.value : env.secureValue}
                        </span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {initContainer.properties?.volumeMounts && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Mounts</DescriptionListTerm>
                  <DescriptionListDescription>
                    {initContainer.properties?.volumeMounts.map((mount, index) => (
                      <div key={index}>
                        {mount.name}:
                        <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{mount.mountPath}</span>
                      </div>
                    ))}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {initContainer.properties?.instanceView?.events &&
                initContainer.properties?.instanceView?.events.length > 0 && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Events</DescriptionListTerm>
                    <DescriptionListDescription>
                      <TableComposable aria-label="Events" variant={TableVariant.compact} borders={false}>
                        <Tbody>
                          {initContainer.properties?.instanceView?.events.map((event, index) => (
                            <DetailsContainerGroupEvent key={index} event={event} />
                          ))}
                        </Tbody>
                      </TableComposable>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
            </DescriptionList>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </React.Fragment>
  );
};

export default DetailsContainerGroupInitContainer;
