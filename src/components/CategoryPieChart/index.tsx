'use client';

import { ReactNode } from 'react';
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie';

export interface SubCategorySlice {
  id: string;
  name: string;
  amount: number;
}

export interface CategorySlice {
  id: number;
  name: string;
  value: number;
  rawAmount: number;
  color: string;
  subCategories: SubCategorySlice[];
}

interface Props {
  data: CategorySlice[];
  renderTooltip: (slice: CategorySlice) => ReactNode;
}

export const CategoryPieChart = ({ data, renderTooltip }: Props) => {
  const renderShape = ({ isActive, outerRadius, index, ...rest }: PieSectorShapeProps) => (
    <Sector
      {...rest}
      outerRadius={isActive ? outerRadius + 4 : outerRadius}
      fill={data[index].color}
      stroke="currentColor"
      className="stroke-content1 focus:outline-hidden cursor-pointer transition-all duration-300 ease-in-out"
    />
  );

  return (
    <div className="relative flex h-56 w-full items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return renderTooltip(payload[0].payload as CategorySlice);
              }
              return null;
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            shape={renderShape}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
