import React, { useCallback, useEffect, useState, memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useAppStore } from '../store';

// ─── Memoized Node Components ────────────────────────────────────────────────

const IdeaNode = memo(({ data }: NodeProps) => (
  <div className="px-4 py-3 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_var(--color-border)] min-w-[140px] text-center">
    <div className="font-bold text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-primary)] mb-1">
      Idea
    </div>
    <div className="font-mono text-[11px] text-[var(--color-text-secondary)] leading-snug">
      {(data.text as string) || 'No idea yet'}
    </div>
  </div>
));

const AssumptionNode = memo(({ data }: NodeProps) => {
  const color = data.confidence === 'high' ? '#3a7d44' : data.confidence === 'medium' ? '#d4a017' : '#c4553a';
  return (
    <div
      className="px-3 py-2 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_var(--color-border)] min-w-[120px]"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="font-mono text-[10px] text-[var(--color-text-secondary)] leading-snug">
        {data.text as string}
      </div>
      <div className="mt-1">
        <span
          className="inline-block font-mono text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 border"
          style={{ borderColor: color, color }}
        >
          {data.confidence as string}
        </span>
      </div>
    </div>
  );
});

const RiskNode = memo(({ data }: NodeProps) => {
  const color = data.severity === 'high' ? '#c4553a' : data.severity === 'medium' ? '#d4a017' : '#8a8680';
  return (
    <div
      className="px-3 py-2 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_var(--color-border)] min-w-[120px]"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="font-bold text-[9px] uppercase tracking-[0.1em]" style={{ color }}>
        ⚠ Risk
      </div>
      <div className="font-mono text-[10px] text-[var(--color-text-secondary)] leading-snug mt-0.5">
        {data.text as string}
      </div>
    </div>
  );
});

const MilestoneNode = memo(({ data }: NodeProps) => (
  <div className="px-3 py-2 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_var(--color-border)] min-w-[130px]">
    <div className="font-bold text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
      {data.title as string}
    </div>
    <div className="font-mono text-[9px] text-[var(--color-text-secondary)] leading-snug mt-0.5">
      {data.description as string}
    </div>
  </div>
));

const ActionNode = memo(({ data }: NodeProps) => (
  <div className="px-4 py-3 border-2 border-[var(--color-border)] bg-[var(--color-border)] shadow-[3px_3px_0px_0px_#3a3937] min-w-[140px] text-center">
    <div className="font-bold text-[10px] uppercase tracking-[0.1em] text-[var(--color-base)]">
      ⚡ First Action
    </div>
    <div className="font-mono text-[10px] text-white/80 leading-snug mt-1">
      {data.text as string}
    </div>
  </div>
));

const nodeTypes = {
  idea: IdeaNode,
  assumption: AssumptionNode,
  risk: RiskNode,
  milestone: MilestoneNode,
  action: ActionNode,
};

// ─── Dagre Layout ────────────────────────────────────────────────────────────

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_W = 180;
const NODE_H = 80;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  dagreGraph.setGraph({ rankdir: 'TB', align: 'UL', nodesep: 60, ranksep: 100 });
  nodes.forEach((n) => dagreGraph.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
  dagre.layout(dagreGraph);
  const layouted = nodes.map((n) => {
    const pos = dagreGraph.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });
  return { nodes: layouted, edges };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PlanGraphView() {
  const plan = useAppStore((s) => s.plan);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const n: Node[] = [];
    const e: Edge[] = [];

    // Idea node
    n.push({
      id: 'idea',
      type: 'idea',
      data: { text: plan.idea || 'No idea yet' },
      position: { x: 0, y: 0 },
    });

    // Assumptions
    (plan.assumptions || []).forEach((a: any, i: number) => {
      n.push({
        id: `assumption-${i}`,
        type: 'assumption',
        data: { text: a.text || a, confidence: a.confidence || 'medium' },
        position: { x: 0, y: 0 },
      });
      e.push({
        id: `e-idea-a${i}`,
        source: 'idea',
        target: `assumption-${i}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#d6d3cd', strokeWidth: 1.5 },
      });
    });

    // Risks
    (plan.risks || []).forEach((r: any, i: number) => {
      n.push({
        id: `risk-${i}`,
        type: 'risk',
        data: { text: r.text, severity: r.severity || 'medium' },
        position: { x: 0, y: 0 },
      });
      const parent = plan.assumptions?.length ? 'assumption-0' : 'idea';
      e.push({
        id: `e-${parent}-r${i}`,
        source: parent,
        target: `risk-${i}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#d6d3cd', strokeWidth: 1.5, strokeDasharray: '5,5' },
      });
    });

    // Milestones chain
    (plan.milestones || []).forEach((m: any, i: number) => {
      n.push({
        id: `milestone-${i}`,
        type: 'milestone',
        data: { title: m.title, description: m.description },
        position: { x: 0, y: 0 },
      });
      if (i === 0) {
        e.push({
          id: `e-idea-m${i}`,
          source: 'idea',
          target: `milestone-${i}`,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#1a1917', strokeWidth: 2 },
        });
      } else {
        e.push({
          id: `e-m${i - 1}-m${i}`,
          source: `milestone-${i - 1}`,
          target: `milestone-${i}`,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#1a1917', strokeWidth: 2 },
        });
      }
    });

    // First Action
    if (plan.firstAction) {
      n.push({
        id: 'action',
        type: 'action',
        data: { text: plan.firstAction },
        position: { x: 0, y: 0 },
      });
      const lastMs = plan.milestones?.length ? `milestone-${plan.milestones.length - 1}` : 'idea';
      e.push({
        id: 'e-last-action',
        source: lastMs,
        target: 'action',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#1a1917', strokeWidth: 2 },
      });
    }

    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(n, e);
    setNodes(layoutNodes);
    setEdges(layoutEdges);

    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [plan, fitView]);

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="placeholder-box flex-col gap-3 text-center max-w-xs">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Add plan content to see the graph
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={true}
        nodesConnectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={0.5} color="#d6d3cd" />
        <Controls className="border-2 border-[var(--color-border)] shadow-[2px_2px_0px_0px_var(--color-border)] [&>button]:bg-[var(--color-surface)] [&>button]:border-[var(--color-border)] [&>button]:text-[var(--color-text-primary)] [&>button:hover]:bg-[var(--color-surface-raised)]" />
        <MiniMap
          className="border-2 border-[var(--color-border)] !bg-[var(--color-surface-raised)]"
          nodeColor="#1a1917"
          maskColor="rgba(26,25,23,0.1)"
        />
      </ReactFlow>
    </div>
  );
}
