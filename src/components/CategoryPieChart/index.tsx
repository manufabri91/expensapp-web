'use client';

import { memo, ReactNode } from 'react';
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

export const CategoryPieChart = memo(({ data, renderTooltip }: Props) => {
  const renderShape = ({ isActive, outerRadius, index, ...rest }: PieSectorShapeProps) => (
    <Sector
      {...rest}
      outerRadius={isActive ? outerRadius + 10 : outerRadius}
      fill={data[index].color}
      className="stroke-accent-foreground cursor-pointer stroke-2 transition-all duration-300 ease-in-out focus:outline-hidden"
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
          <Pie data={data} innerRadius={60} outerRadius={90} cornerRadius={4} dataKey="value" shape={renderShape} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

CategoryPieChart.displayName = 'CategoryPieChart';
