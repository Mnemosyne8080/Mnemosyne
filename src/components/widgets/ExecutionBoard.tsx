import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { ChevronDown, ChevronRight, ChevronLeft, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  desc: string;
  detail?: string;
  deliverable?: string;
}

interface ExecutionBoardProps {
  data: {
    columns: Array<{
      id: string;
      title: string;
      tasks: Task[];
    }>;
  };
}

export function ExecutionBoard({ data }: ExecutionBoardProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [activeCol, setActiveCol] = useState(0);

  const toggleTask = (id: string) => {
    const newSet = new Set(completedTasks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedTasks(newSet);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedTasks(newSet);
  };

  const totalTasks = data.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const col = data.columns[activeCol];
  const colCompleted = col.tasks.filter(t => completedTasks.has(t.id)).length;

  return (
    <Card className="my-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>EXECUTION PLAN</CardTitle>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-mono text-xs text-gray-500">{completedCount}/{totalTasks}</span>
            <div className="w-36 h-4 border-2 border-black bg-white relative">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold mix-blend-difference text-white">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Column navigation */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button
          onClick={() => setActiveCol(i => Math.max(0, i - 1))}
          disabled={activeCol === 0}
          className="p-1 border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          {data.columns.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCol(idx)}
              className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border-2 border-black transition-all ${
                idx === activeCol
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveCol(i => Math.min(data.columns.length - 1, i + 1))}
          disabled={activeCol === data.columns.length - 1}
          className="p-1 border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Active column */}
      <div className="px-4 pb-4 pt-2">
        <div className="bg-black text-white p-2 text-center font-mono font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
          <span>{col.title}</span>
          <span className="text-xs font-normal opacity-70">{colCompleted}/{col.tasks.length}</span>
        </div>

        <div className="space-y-3">
          {col.tasks.map(task => {
            const isDone = completedTasks.has(task.id);
            const isExpanded = expandedTasks.has(task.id);
            const hasDetail = task.detail || task.deliverable;

            return (
              <div
                key={task.id}
                className={`border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${isDone ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start space-x-3 p-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5 text-black" />
                      : <Circle className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`font-mono text-sm block ${isDone ? 'line-through text-gray-400' : 'text-black'}`}>
                      {task.desc}
                    </span>
                    {hasDetail && (
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="flex items-center gap-1 mt-1 text-xs font-mono text-gray-500 hover:text-black"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {isExpanded ? 'Less' : 'Details'}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && hasDetail && (
                  <div className="px-3 pb-3 pl-11 space-y-2 border-t-2 border-gray-300 bg-gray-100 -mx-0.5">
                    {task.detail && (
                      <div className="pt-2">
                        <span className="font-mono text-[10px] font-bold uppercase text-gray-500">Detail</span>
                        <p className="font-mono text-xs text-gray-800 mt-0.5">{task.detail}</p>
                      </div>
                    )}
                    {task.deliverable && (
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase text-gray-500">Deliverable</span>
                        <p className="font-mono text-xs text-gray-800 mt-0.5">{task.deliverable}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
