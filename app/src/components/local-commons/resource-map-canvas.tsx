'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Resource } from '@/db/schema';
import { ResourceNode } from './resource-node';
import { ResourceGroupNode } from './resource-group-node';

const NODE_TYPES = {
  resource: ResourceNode,
  group: ResourceGroupNode,
};

// Layout constants
const GROUP_COLS = 2;
const GROUP_W = 260;
const GROUP_H_HEADER = 44;
const NODE_W = 192; // w-48
const NODE_H = 70;
const NODE_GAP = 12;
const GROUP_PAD = 16;
const GROUP_COL_GAP = 40;
const GROUP_ROW_GAP = 40;

const KIND_ORDER = ['tool', 'skill', 'space', 'material', 'other'] as const;
const KIND_LABEL: Record<string, string> = {
  tool: 'Tools',
  space: 'Spaces',
  skill: 'Skills',
  material: 'Materials',
  other: 'Other',
};

type Props = {
  resources: Resource[];
  onSelect: (resource: Resource) => void;
};

function buildLayout(resources: Resource[]): { nodes: Node[]; edges: Edge[] } {
  // Group by kind, preserving KIND_ORDER
  const byKind = new Map<string, Resource[]>();
  for (const kind of KIND_ORDER) byKind.set(kind, []);
  for (const r of resources) {
    const list = byKind.get(r.kind) ?? byKind.get('other')!;
    list.push(r);
  }

  const nodes: Node[] = [];
  const activeKinds = KIND_ORDER.filter((k) => (byKind.get(k)?.length ?? 0) > 0);

  let col = 0;
  let row = 0;
  let maxHeightInRow = 0;
  let xOffset = 0;
  let yOffset = 0;

  // Track column x offsets per row to enable 2-column layout
  const colX = [0, GROUP_W + GROUP_COL_GAP];

  for (const kind of activeKinds) {
    const items = byKind.get(kind) ?? [];
    const groupId = `group-${kind}`;

    const itemsPerCol = Math.ceil(items.length / 1); // single column of nodes per group
    const groupContentH = itemsPerCol * (NODE_H + NODE_GAP) - NODE_GAP + GROUP_PAD * 2;
    const groupH = GROUP_H_HEADER + groupContentH;

    xOffset = colX[col % GROUP_COLS] ?? 0;
    if (col % GROUP_COLS === 0 && col > 0) {
      yOffset += maxHeightInRow + GROUP_ROW_GAP;
      maxHeightInRow = 0;
    }

    // Group node (acts as a visual container header — children positioned inside)
    nodes.push({
      id: groupId,
      type: 'group',
      position: { x: xOffset, y: yOffset },
      style: { width: GROUP_W, height: groupH },
      data: { label: KIND_LABEL[kind] ?? kind, count: items.length },
      draggable: false,
      selectable: false,
    });

    // Resource nodes inside the group
    items.forEach((resource, i) => {
      nodes.push({
        id: `resource-${resource.id}`,
        type: 'resource',
        position: {
          x: GROUP_PAD,
          y: GROUP_H_HEADER + GROUP_PAD + i * (NODE_H + NODE_GAP),
        },
        parentId: groupId,
        extent: 'parent',
        data: { resource, onSelect: () => {} }, // onSelect injected via closure below
        draggable: false,
      });
    });

    maxHeightInRow = Math.max(maxHeightInRow, groupH);
    col++;
  }

  return { nodes, edges: [] };
}

export function ResourceMapCanvas({ resources, onSelect }: Props) {
  const { nodes: initialNodes } = useMemo(() => buildLayout(resources), [resources]);

  // Inject onSelect into resource node data
  const nodesWithSelect = useMemo(
    () =>
      initialNodes.map((n) =>
        n.type === 'resource'
          ? {
              ...n,
              data: {
                ...(n.data as { resource: Resource }),
                onSelect,
              },
            }
          : n,
      ),
    [initialNodes, onSelect],
  );

  const [nodes, , onNodesChange] = useNodesState(nodesWithSelect);
  const [edges, , onEdgesChange] = useEdgesState([]);

  const onNodeClick = useCallback(() => {
    // handled by ResourceNode button's onClick
  }, []);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded border border-[color:var(--color-rule)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-rule)" gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
