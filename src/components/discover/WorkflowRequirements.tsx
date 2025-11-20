import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Info } from 'lucide-react';
import { Workflow, Participant } from '@/lib/canton-data';

interface WorkflowRequirementsProps {
  workflow: Workflow;
  network: Participant[];
}

export const WorkflowRequirements: React.FC<WorkflowRequirementsProps> = ({ workflow, network }) => {
  // Helper to check if a role is fulfilled
  const isRoleFulfilled = (role: string) => {
    return network.some(p => p.capabilities[role] === 1);
  };

  // Calculate progress
  const totalRoles = workflow.roles.length;
  const fulfilledCount = workflow.roles.filter(isRoleFulfilled).length;
  const progress = Math.round((fulfilledCount / totalRoles) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-24 right-4 z-30 w-80 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-blue-400" />
          Required Roles
        </h3>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{workflow.name}</span>
          <span>{progress}% Ready</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {workflow.stages.map((stage, stageIndex) => (
          <div key={stage.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold text-white/80 border border-white/10">
                {stageIndex + 1}
              </span>
              <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                {stage.name}
              </h4>
            </div>
            
            <div className="space-y-2 pl-2 border-l border-white/10 ml-2.5">
              {stage.roles.map(role => {
                const fulfilled = isRoleFulfilled(role);
                const fulfillingParticipants = network.filter(p => p.capabilities[role] === 1);
                
                return (
                  <div 
                    key={role}
                    className={`group flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      fulfilled ? 'bg-green-500/5' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="mt-0.5">
                      {fulfilled ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${fulfilled ? 'text-white' : 'text-white/60'}`}>
                        {role.replace(/_/g, ' ')}
                      </div>
                      {fulfilled && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {fulfillingParticipants.map(p => (
                            <span 
                              key={p.id}
                              className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/80 truncate max-w-full"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

