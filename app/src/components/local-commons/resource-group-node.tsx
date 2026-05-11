'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

type GroupNodeData = {
  label: string;
  count: number;
};

export const ResourceGroupNode = memo(function ResourceGroupNode({
  data,
}: NodeProps & { data: GroupNodeData }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)]">
      <div className="flex items-center gap-2 border-b border-[color:var(--color-rule)] px-3 py-2">
        <span className="text-[11px] font-[var(--font-display)] font-semibold tracking-widest text-[color:var(--color-muted)] uppercase">
          {data.label}
        </span>
        <span className="text-[10px] font-[var(--font-mono)] text-[color:var(--color-muted)]">
          {data.count}
        </span>
      </div>
    </div>
  );
});
