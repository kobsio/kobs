import { TooltipAnchor, TooltipWrapper } from '@nivo/tooltip';
import React from 'react';
import { SquareIcon } from '@patternfly/react-icons';

interface IChartTooltipProps {
  anchor?: TooltipAnchor;
  color: string;
  label: string;
  position?: [number, number];
  title?: string;
}

export const ChartTooltip: React.FunctionComponent<IChartTooltipProps> = ({
  anchor,
  color,
  label,
  position,
  title,
}: IChartTooltipProps) => {
  const anchorDefault = anchor || 'right';
  const positionDefault = position || [0, 5];

  return (
    <TooltipWrapper anchor={anchorDefault} position={positionDefault}>
      <div
        style={{
          background: '#151515',
          color: '#f0f0f0',
          fontFamily: '"RedHatText", "Overpass", overpass, helvetica, arial, sans-serif',
          fontSize: '14px',
          padding: '8px',
          whiteSpace: 'nowrap',
        }}
      >
        {title && (
          <div>
            <b>{title}</b>
          </div>
        )}
        <div>
          <SquareIcon color={color} /> {label}
        </div>
      </div>
    </TooltipWrapper>
  );
};
