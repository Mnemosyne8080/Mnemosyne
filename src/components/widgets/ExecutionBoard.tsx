import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

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

  return (
    <Card className="my-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full overflow-x-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>EXECUTION PLAN</CardTitle>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-500">{completedCount}/{totalTasks} tasks</span>
            <div className="w-24 h-2 border-2 border-black bg-white">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold">{progress}%</span>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-col md:flex-row gap-6 mt-4 min-w-max md:min-w-0">
        {data.columns.map((col) => {
          const colCompleted = col.tasks.filter(t => completedTasks.has(t.id)).length;
          return (
            <div key={col.id} className="flex-1 min-w-[280px]">
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
                        <div className="px-3 pb-3 pl-11 space-y-2">
                          {task.detail && (
                            <div>
                              <span className="font-mono text-[10px] font-bold uppercase text-gray-400">Detail</span>
                              <p className="font-mono text-xs text-gray-700 mt-0.5">{task.detail}</p>
                            </div>
                          )}
                          {task.deliverable && (
                            <div>
                              <span className="font-mono text-[10px] font-bold uppercase text-gray-400">Deliverable</span>
                              <p className="font-mono text-xs text-gray-700 mt-0.5">{task.deliverable}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
