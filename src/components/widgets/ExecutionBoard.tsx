import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { ChevronDown, ChevronRight, ChevronLeft, CheckCircle2, Circle, Pencil, PartyPopper } from 'lucide-react';

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
  const [showCelebration, setShowCelebration] = useState(false);

  const totalTasks = data.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const allDone = totalTasks > 0 && completedCount === totalTasks;

  useEffect(() => {
    if (allDone && !showCelebration) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [allDone]);

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

  const resetCompletion = () => {
    setCompletedTasks(new Set());
    setShowCelebration(false);
  };

  const col = data.columns[activeCol];
  const colCompleted = col.tasks.filter(t => completedTasks.has(t.id)).length;

  return (
    <div className="relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-black text-white px-8 py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <div className="flex items-center gap-3">
              <PartyPopper className="w-8 h-8" />
              <div>
                <div className="font-mono font-black text-xl uppercase tracking-widest">PLAN COMPLETE!</div>
                <div className="font-mono text-sm opacity-80">All tasks executed successfully.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className={`my-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${allDone ? 'bg-black text-white' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className={allDone ? 'text-white' : ''}>EXECUTION PLAN</CardTitle>
            <div className="flex items-center gap-3 flex-shrink-0">
              {allDone && (
                <button
                  onClick={resetCompletion}
                  className="p-1.5 border-2 border-white hover:bg-gray-800 transition-colors"
                  title="Edit completion status"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <span className={`font-mono text-xs ${allDone ? 'text-gray-300' : 'text-gray-500'}`}>{completedCount}/{totalTasks}</span>
              <div className="w-40 h-5 border-2 border-current relative">
                <div
                  className="h-full bg-current transition-all"
                  style={{ width: `${progress}%` }}
                />
                <span className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold ${allDone ? 'text-black mix-blend-difference' : 'mix-blend-difference'} text-white`}>
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
            className={`p-1 border-2 border-current disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-colors ${allDone ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            {data.columns.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActiveCol(idx)}
                className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider border-2 border-current transition-all ${
                  idx === activeCol
                    ? (allDone ? 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]')
                    : (allDone ? 'bg-transparent text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-100')
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveCol(i => Math.min(data.columns.length - 1, i + 1))}
            disabled={activeCol === data.columns.length - 1}
            className={`p-1 border-2 border-current disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-colors ${allDone ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Active column */}
        <div className="px-4 pb-4 pt-2">
          <div className={`p-2 text-center font-mono font-bold uppercase tracking-widest mb-4 flex items-center justify-between ${allDone ? 'bg-white text-black' : 'bg-black text-white'}`}>
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
                  className={`border-2 border-current transition-all ${isDone ? 'opacity-50' : ''} ${allDone ? 'bg-gray-900' : 'bg-gray-50'} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  <div className="flex items-start space-x-3 p-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {isDone
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <Circle className="w-5 h-5 opacity-40" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`font-mono text-sm block ${isDone ? 'line-through opacity-60' : ''}`}>
                        {task.desc}
                      </span>
                      {hasDetail && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className={`flex items-center gap-1 mt-1 text-xs font-mono transition-colors ${allDone ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && hasDetail && (
                    <div className={`px-3 pb-3 pl-11 space-y-2 border-t-2 -mx-0.5 ${allDone ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
                      {task.detail && (
                        <div className="pt-2">
                          <span className={`font-mono text-[10px] font-bold uppercase ${allDone ? 'text-gray-500' : 'text-gray-500'}`}>Detail</span>
                          <p className={`font-mono text-xs mt-0.5 ${allDone ? 'text-gray-300' : 'text-gray-800'}`}>{task.detail}</p>
                        </div>
                      )}
                      {task.deliverable && (
                        <div>
                          <span className={`font-mono text-[10px] font-bold uppercase ${allDone ? 'text-gray-500' : 'text-gray-500'}`}>Deliverable</span>
                          <p className={`font-mono text-xs mt-0.5 ${allDone ? 'text-gray-300' : 'text-gray-800'}`}>{task.deliverable}</p>
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
    </div>
  );
}
