'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Resource } from '@/db/schema';

const KIND_LABEL: Record<string, string> = {
  tool: 'Tool',
  space: 'Space',
  skill: 'Skill',
  material: 'Material',
  other: 'Other',
};

type ResourceNodeData = {
  resource: Resource;
  onSelect: (resource: Resource) => void;
};

export const ResourceNode = memo(function ResourceNode({ data }: { data: ResourceNodeData }) {
  const { resource, onSelect } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <button
        type="button"
        onClick={() => onSelect(resource)}
        className="w-48 rounded border border-[color:var(--color-rule)] bg-white px-3 py-2.5 text-left shadow-sm transition-shadow hover:border-[color:var(--color-accent)] hover:shadow-md"
      >
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 text-[9px] font-[var(--font-mono)] tracking-wider text-[color:var(--color-muted)] uppercase">
            {KIND_LABEL[resource.kind] ?? resource.kind}
          </span>
        </div>
        <p className="truncate text-[13px] leading-tight font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
          {resource.title}
        </p>
        {resource.locationHint ? (
          <p className="mt-1 truncate text-[11px] text-[color:var(--color-muted)]">
            {resource.locationHint}
          </p>
        ) : null}
      </button>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  );
});
