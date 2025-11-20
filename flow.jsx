import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Workflow, Building2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const FlowRydDiscovery = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [matchedParticipants, setMatchedParticipants] = useState([]);
  const [viewMode, setViewMode] = useState('workflows'); // workflows, participants, build

  // Workflow definitions
  const workflows = [
    {
      id: 'WF-021',
      name: 'Collateral Management',
      category: 'Post-Trade / Post-Settlement Services',
      roles: ['Collateral_Provider', 'Collateral_Taker', 'Collateral_Agent', 'Custody', 
              'Valuation_Pricing', 'Settlement', 'Registry', 'Legal_Compliance']
    },
    {
      id: 'WF-022',
      name: 'Repo Processing',
      category: 'Post-Trade / Post-Settlement Services',
      roles: ['Cash_Lender', 'Cash_Borrower', 'Repo_Platform', 'Custody', 
              'Valuation_Pricing', 'Settlement', 'Registry', 'Legal_Compliance']
    }
  ];

  // Participant capabilities (from Tab 2)
  const participants = [
    { name: "DTCC (DTC)", canton_role: "Registry + Issuer", capabilities: { Registry: 1 }, criticality: "CRITICAL" },
    { name: "Bank of America", canton_role: "Financing", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1, Cash_Lender: 1, Cash_Borrower: 1 }, criticality: "CRITICAL" },
    { name: "Circle", canton_role: "Onchain Data", capabilities: { Settlement: 1 }, criticality: "CRITICAL" },
    { name: "Citadel Securities", canton_role: "Liquidity", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1 }, criticality: "CRITICAL" },
    { name: "Cumberland DRW", canton_role: "Financing", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1 }, criticality: "CRITICAL" },
    { name: "Digital Asset", canton_role: "Orchestration", capabilities: {}, criticality: "CRITICAL" },
    { name: "Hidden Road", canton_role: "Custody", capabilities: { Custody: 1 }, criticality: "CRITICAL" },
    { name: "Société Générale", canton_role: "Financing", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1, Cash_Lender: 1, Cash_Borrower: 1 }, criticality: "CRITICAL" },
    { name: "Tradeweb", canton_role: "Exchanges", capabilities: {}, criticality: "CRITICAL" },
    { name: "Virtu Financial", canton_role: "Liquidity", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1 }, criticality: "CRITICAL" },
    { name: "Broadridge DLR", canton_role: "Collateral", capabilities: { Repo_Platform: 1 }, criticality: "CRITICAL" },
    { name: "Clearstream", canton_role: "Registry", capabilities: { Settlement: 1, Registry: 1 }, criticality: "REQUIRED" },
    { name: "Euroclear", canton_role: "Registry + Collateral", capabilities: { Collateral_Agent: 1, Settlement: 1, Registry: 1 }, criticality: "REQUIRED" },
    { name: "Kaiko", canton_role: "Onchain Data", capabilities: { Valuation_Pricing: 1 }, criticality: "REQUIRED" },
    { name: "State Street", canton_role: "Custody", capabilities: { Custody: 1 }, criticality: "REQUIRED" },
    { name: "BNY Mellon", canton_role: "Custody", capabilities: { Custody: 1 }, criticality: "REQUIRED" },
    { name: "JPMorgan", canton_role: "Financing", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1, Cash_Lender: 1, Cash_Borrower: 1 }, criticality: "REQUIRED" },
    { name: "Goldman Sachs", canton_role: "Tokenized Assets", capabilities: { Collateral_Provider: 1 }, criticality: "REQUIRED" },
    { name: "Allen & Overy", canton_role: "Compliance", capabilities: { Legal_Compliance: 1 }, criticality: "REQUIRED" },
    { name: "Clifford Chance", canton_role: "Compliance", capabilities: { Legal_Compliance: 1 }, criticality: "REQUIRED" },
    { name: "EquiLend", canton_role: "Collateral", capabilities: { Collateral_Agent: 1 }, criticality: "OPTIONAL" },
    { name: "Fidelity", canton_role: "Liquidity", capabilities: { Collateral_Provider: 1, Cash_Lender: 1 }, criticality: "OPTIONAL" },
    { name: "Franklin Templeton", canton_role: "Liquidity", capabilities: { Collateral_Provider: 1, Cash_Lender: 1 }, criticality: "OPTIONAL" },
    { name: "iCapital", canton_role: "Liquidity", capabilities: { Collateral_Provider: 1, Cash_Lender: 1 }, criticality: "OPTIONAL" },
    { name: "Citi", canton_role: "Financing", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1, Cash_Lender: 1, Cash_Borrower: 1 }, criticality: "OPTIONAL" },
    { name: "Commerzbank", canton_role: "Financing", capabilities: { Collateral_Provider: 1, Collateral_Taker: 1, Cash_Lender: 1, Cash_Borrower: 1 }, criticality: "OPTIONAL" }
  ];

  // Matching logic
  const findMatches = (workflow, roles) => {
    if (!workflow || roles.length === 0) return [];
    
    return participants.filter(p => {
      return roles.some(role => p.capabilities[role] === 1);
    }).map(p => ({
      ...p,
      matchedRoles: roles.filter(role => p.capabilities[role] === 1)
    }));
  };

  useEffect(() => {
    if (selectedWorkflow && selectedRoles.length > 0) {
      const matches = findMatches(selectedWorkflow, selectedRoles);
      setMatchedParticipants(matches);
    } else {
      setMatchedParticipants([]);
    }
  }, [selectedWorkflow, selectedRoles]);

  const handleWorkflowSelect = (workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedRoles([]);
    setViewMode('participants');
  };

  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const getCriticalityColor = (criticality) => {
    switch(criticality) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'REQUIRED': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OPTIONAL': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Workflow className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FlowRyd Discovery</h1>
                <p className="text-sm text-gray-600">Discover workflows and match participants on Canton Network</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('workflows')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'workflows' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Workflows
              </button>
              <button
                onClick={() => setViewMode('participants')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'participants' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!selectedWorkflow}
              >
                Match Participants
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Workflows View */}
        {viewMode === 'workflows' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Available Workflow Templates</h2>
              <p className="text-gray-600">Select a workflow to discover matching participants</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflows.map(workflow => (
                <div
                  key={workflow.id}
                  onClick={() => handleWorkflowSelect(workflow)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Workflow className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{workflow.name}</h3>
                        <span className="text-xs text-gray-500">{workflow.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {workflow.category}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Required Roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.roles.slice(0, 4).map(role => (
                        <span key={role} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {role.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {workflow.roles.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          +{workflow.roles.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants Matching View */}
        {viewMode === 'participants' && selectedWorkflow && (
          <div>
            <div className="mb-6 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                  <p className="text-sm text-gray-600">{selectedWorkflow.id} • {selectedWorkflow.category}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedWorkflow(null);
                    setSelectedRoles([]);
                    setViewMode('workflows');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Change Workflow
                </button>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Select roles to find matching participants:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkflow.roles.map(role => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedRoles.includes(role)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {role.replace(/_/g, ' ')}
                      {selectedRoles.includes(role) && (
                        <CheckCircle2 className="inline-block ml-1 w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matched Participants */}
            {selectedRoles.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Matching Participants ({matchedParticipants.length})
                  </h3>
                </div>

                {matchedParticipants.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No participants match the selected roles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchedParticipants.map(participant => (
                      <div
                        key={participant.name}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-600" />
                            <h4 className="font-bold text-gray-900 text-sm">{participant.name}</h4>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getCriticalityColor(participant.criticality)}`}>
                            {participant.criticality}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-xs text-gray-600 font-medium">Canton Role:</span>
                          <p className="text-sm text-gray-800">{participant.canton_role}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-600 font-medium mb-1 block">Can fulfill:</span>
                          <div className="flex flex-wrap gap-1">
                            {participant.matchedRoles.map(role => (
                              <span key={role} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {role.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedRoles.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Select roles to discover participants</h4>
                  <p className="text-sm text-blue-700">
                    Choose one or more roles above to see which Canton Network participants can fulfill them.
                    The matching engine will show you all available options based on participant capabilities.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowRydDiscovery;