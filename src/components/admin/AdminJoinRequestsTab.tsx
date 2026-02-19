"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';

interface Flow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean | null;
  createdAt: string;
}

interface JoinRequest {
  id: string;
  flowId: string;
  requesterId: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface ConfirmAction {
  requestId: string;
  flowId: string;
  action: 'approved' | 'rejected';
}

interface Banner {
  type: 'success' | 'error';
  message: string;
}

export const AdminJoinRequestsTab: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [joinRequests, setJoinRequests] = useState<Record<string, JoinRequest[]>>({});
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all flows
      const flowsResponse = await fetch('/api/flows?limit=50');
      if (!flowsResponse.ok) throw new Error('Failed to fetch flows');
      
      const flowsData = await flowsResponse.json();
      const allFlows: Flow[] = flowsData.data || [];
      
      // 2. Filter to public published flows
      const publicFlows = allFlows.filter(flow => 
        flow.isPublic === true && flow.status === 'published'
      );
      setFlows(publicFlows);
      
      // 3. Fetch join requests for each public flow
      if (publicFlows.length > 0) {
        const joinRequestPromises = publicFlows.map(async (flow) => {
          try {
            const response = await fetch(`/api/flows/${flow.id}/join`);
            if (response.ok) {
              const data = await response.json();
              return { flowId: flow.id, requests: data.data?.joinRequests || [] };
            }
            return { flowId: flow.id, requests: [] };
          } catch {
            return { flowId: flow.id, requests: [] };
          }
        });
        
        const results = await Promise.all(joinRequestPromises);
        const requestsMap: Record<string, JoinRequest[]> = {};
        results.forEach(({ flowId, requests }) => {
          requestsMap[flowId] = requests;
        });
        
        setJoinRequests(requestsMap);
      }
    } catch (error) {
      console.error('Failed to load join requests:', error);
      showBanner('error', 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, flowId: string, action: 'approved' | 'rejected') => {
    if (confirmAction?.requestId === requestId && confirmAction?.action === action) {
      // Second click - execute action
      try {
        const response = await fetch(`/api/flows/${flowId}/join/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action })
        });

        if (!response.ok) throw new Error(`Failed to ${action} request`);

        // Optimistically update local state
        setJoinRequests(prev => ({
          ...prev,
          [flowId]: prev[flowId]?.map(req => 
            req.id === requestId 
              ? { ...req, status: action, reviewedAt: new Date().toISOString() }
              : req
          ) || []
        }));

        showBanner('success', `Request ${action} successfully`);
        setConfirmAction(null);
      } catch (error) {
        console.error(`Failed to ${action} request:`, error);
        showBanner('error', `Failed to ${action} request`);
        setConfirmAction(null);
      }
    } else {
      // First click - show confirmation
      setConfirmAction({ requestId, flowId, action });
    }
  };

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPending = Object.values(joinRequests).flat().filter(req => req.status === 'pending').length;
  const totalFlowsWithRequests = Object.keys(joinRequests).filter(flowId => 
    joinRequests[flowId]?.length > 0
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border ${
              banner.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {banner.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && flows.length > 0 && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Join Requests Overview</h2>
              <p className="text-white/60 text-sm mt-1">
                {totalPending} pending requests across {totalFlowsWithRequests} flows
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-400" />
          <p className="text-white/60">Loading join requests...</p>
        </div>
      )}

      {!loading && flows.length === 0 && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <h3 className="text-lg font-medium text-white mb-2">No Public Published Flows</h3>
          <p className="text-white/60">
            Publish a flow and make it public to receive join requests.
          </p>
        </div>
      )}

      {!loading && flows.length > 0 && (
        <div className="space-y-6">
          {flows.map(flow => {
            const requests = joinRequests[flow.id] || [];
            const pendingCount = requests.filter(req => req.status === 'pending').length;

            return (
              <div key={flow.id} className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{flow.title}</h3>
                      {flow.description && (
                        <p className="text-white/60 text-sm mt-1">{flow.description}</p>
                      )}
                    </div>
                    {pendingCount > 0 && (
                      <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm font-medium">
                        {pendingCount} pending
                      </div>
                    )}
                  </div>
                </div>

                {requests.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-8 h-8 mx-auto mb-3 text-white/20" />
                    <p className="text-white/60">No join requests for this flow.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                          <th className="text-left p-4 text-xs font-bold text-white/40 tracking-wide">REQUESTER ID</th>
                          <th className="text-left p-4 text-xs font-bold text-white/40 tracking-wide">MESSAGE</th>
                          <th className="text-left p-4 text-xs font-bold text-white/40 tracking-wide">STATUS</th>
                          <th className="text-left p-4 text-xs font-bold text-white/40 tracking-wide">REQUESTED AT</th>
                          <th className="text-left p-4 text-xs font-bold text-white/40 tracking-wide">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(request => (
                          <tr key={request.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <code className="text-xs text-white/80 bg-white/5 px-2 py-1 rounded font-mono">
                                {request.requesterId}
                              </code>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-white/70 max-w-xs truncate">
                                {request.message || (
                                  <span className="text-white/40 italic">No message</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(request.status)}
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-white/60">
                                {formatDate(request.createdAt)}
                              </div>
                              {request.reviewedAt && (
                                <div className="text-xs text-white/40">
                                  Reviewed {formatDate(request.reviewedAt)}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              {request.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAction(request.id, flow.id, 'approved')}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      confirmAction?.requestId === request.id && confirmAction?.action === 'approved'
                                        ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                                        : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                    }`}
                                  >
                                    {confirmAction?.requestId === request.id && confirmAction?.action === 'approved' 
                                      ? 'Confirm?' 
                                      : 'Approve'
                                    }
                                  </button>
                                  <button
                                    onClick={() => handleAction(request.id, flow.id, 'rejected')}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      confirmAction?.requestId === request.id && confirmAction?.action === 'rejected'
                                        ? 'bg-red-500/30 text-red-300 border border-red-500/50' 
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                    }`}
                                  >
                                    {confirmAction?.requestId === request.id && confirmAction?.action === 'rejected' 
                                      ? 'Confirm?' 
                                      : 'Reject'
                                    }
                                  </button>
                                </div>
                              ) : (
                                <span className="text-white/40 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};