import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';

interface ExecutionBoardProps {
  data: {
    columns: Array<{
      id: string;
      title: string;
      tasks: Array<{ id: string; desc: string }>;
    }>;
  };
}

export function ExecutionBoard({ data }: ExecutionBoardProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    const newSet = new Set(completedTasks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedTasks(newSet);
  };

  return (
    <Card className="my-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full overflow-x-auto">
      <CardHeader>
        <CardTitle>EXECUTION BOARD (30/60/90)</CardTitle>
      </CardHeader>
      
      <div className="flex flex-col md:flex-row gap-6 mt-4 min-w-max md:min-w-0">
        {data.columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[250px]">
             <div className="bg-black text-white p-2 text-center font-mono font-bold uppercase tracking-widest mb-4">
               {col.title}
             </div>
             <div className="space-y-3">
               {col.tasks.map(task => (
                 <label 
                   key={task.id} 
                   className="flex items-start space-x-3 p-3 border-2 border-black bg-gray-50 hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                 >
                   <input 
                     type="checkbox"
                     checked={completedTasks.has(task.id)}
                     onChange={() => toggleTask(task.id)}
                     className="mt-1 w-5 h-5 border-2 border-black rounded-none text-black focus:ring-0 checked:bg-black"
                   />
                   <span className={`font-mono text-sm ${completedTasks.has(task.id) ? 'line-through text-gray-400' : 'text-black'}`}>
                     {task.desc}
                   </span>
                 </label>
               ))}
             </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
