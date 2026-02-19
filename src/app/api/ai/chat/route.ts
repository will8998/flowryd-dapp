import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { ValidationError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

const MOCK_RESPONSES: Array<{ keywords: string[]; response: string; suggestions?: string[] }> = [
  {
    keywords: ['participants', 'network', 'who', 'members'],
    response: 'The Canton Network consists of institutional participants including DTCC, Clearstream, Euroclear, and various banks. Each participant operates their own Canton domain while maintaining privacy through synchronized smart contracts.',
    suggestions: ['Show participant capabilities', 'Explain privacy model', 'View network topology']
  },
  {
    keywords: ['jump', 'cut', 'workflow', 'flow'],
    response: 'Jump Cuts are pre-configured workflow templates that define multi-party coordination flows. Popular Jump Cuts include Repo workflows (C7-K-CW), Settlement flows, and Cross-border payment orchestration.',
    suggestions: ['Browse Jump Cut library', 'Create custom workflow', 'Test workflow simulation']
  },
  {
    keywords: ['deal', 'room', 'private', 'negotiate'],
    response: 'Deal Rooms provide private, encrypted spaces for participants to finalize smart contract terms. All negotiations remain confidential until consensus is reached and contracts are deployed to the network.',
    suggestions: ['Create new deal room', 'View active negotiations', 'Review contract templates']
  },
  {
    keywords: ['privacy', 'confidential', 'security'],
    response: 'Canton ensures transaction privacy through cryptographic protocols. Only involved parties see transaction details while the network maintains global consistency. This enables confidential multi-party workflows at institutional scale.',
    suggestions: ['Learn about zero-knowledge proofs', 'View privacy documentation', 'Configure access controls']
  },
  {
    keywords: ['fees', 'cost', 'pricing', 'optimization'],
    response: 'Fee optimization identifies the most cost-effective execution paths across network participants. Our AI analyzes historical patterns and current network conditions to reduce settlement costs by up to 15 basis points.',
    suggestions: ['Run fee analysis', 'View optimization history', 'Configure cost preferences']
  },
  {
    keywords: ['repo', 'c7', 'clearstream', 'settlement'],
    response: 'The C7-K-CW Jump Cut orchestrates institutional repo workflows between Clearstream (C7), a primary bank (K), and custodian networks (CW). This flow handles collateral management and settlement coordination.',
    suggestions: ['Configure repo parameters', 'View settlement timeline', 'Test counterparty matching']
  },
  {
    keywords: ['sync', 'synchronize', 'state', 'consensus'],
    response: 'Canton\'s synchronization protocol ensures all parties maintain consistent state without revealing private data. The network uses advanced cryptography to achieve both privacy and consistency across domains.',
    suggestions: ['Monitor sync status', 'View consensus metrics', 'Troubleshoot sync issues']
  },
  {
    keywords: ['build', 'create', 'configure', 'setup'],
    response: 'The Flow Workbench lets you drag participants from the network tray to model multi-party coordination flows. Define roles, set constraints, and simulate execution before deployment.',
    suggestions: ['Open Flow Workbench', 'Import flow template', 'Schedule flow execution']
  },
  {
    keywords: ['admin', 'manage', 'governance', 'control'],
    response: 'Network administration involves participant onboarding, governance voting, and system monitoring. Administrators can configure network policies, manage access rights, and oversee protocol upgrades.',
    suggestions: ['View governance proposals', 'Manage participant permissions', 'Monitor network health']
  },
  {
    keywords: ['help', 'guide', 'tutorial', 'learn'],
    response: 'I can help you navigate the Canton Network, build multi-party workflows, configure Jump Cuts, and optimize your institutional coordination flows. What specific area would you like to explore?',
    suggestions: ['Take the guided tour', 'View documentation', 'Contact support']
  }
];

function getMockResponse(userMessage: string, context?: string): ChatResponse {
  const message = userMessage.toLowerCase();
  
  const matchedResponse = MOCK_RESPONSES.find(response =>
    response.keywords.some(keyword => message.includes(keyword))
  );
  
  if (matchedResponse) {
    return {
      message: matchedResponse.response,
      suggestions: matchedResponse.suggestions
    };
  }
  
  if (context) {
    switch (context) {
      case 'DISCOVER':
        return {
          message: 'I can help you explore the Canton Network participants and identify the right institutional partners for your workflow. Which type of participant are you looking to connect with?',
          suggestions: ['Show all participants', 'Filter by capability', 'View participant profiles']
        };
      case 'NAVIGATE':
        return {
          message: 'Let\'s build your multi-party coordination flow. I can suggest optimal Jump Cuts based on your participants and workflow requirements.',
          suggestions: ['Browse Jump Cut templates', 'Create custom flow', 'Simulate workflow execution']
        };
      case 'ACTIVATE':
        return {
          message: 'Ready to finalize your deals? I can help you set up private deal rooms, negotiate terms, and coordinate smart contract deployment.',
          suggestions: ['Create deal room', 'Review pending negotiations', 'Deploy contracts']
        };
      default:
        return {
          message: 'I\'m Ryd AI, your Canton Network assistant. I can help you discover participants, build coordination flows, and finalize institutional deals. How can I assist you today?',
          suggestions: ['Explore the network', 'Build a new flow', 'Learn about Canton']
        };
    }
  }
  
  return {
    message: 'I\'m here to help you navigate the Canton Network and orchestrate institutional workflows. Could you be more specific about what you\'d like to accomplish?',
    suggestions: ['Discover network participants', 'Build coordination flows', 'Set up deal rooms']
  };
}

async function getOpenAIResponse(messages: ChatMessage[], context?: string): Promise<ChatResponse> {
  const systemPrompt = `You are Ryd AI, an intelligent assistant for the Canton Network - a privacy-preserving institutional blockchain network.

CONTEXT: The Canton Network enables confidential multi-party workflows between institutional participants like DTCC, Clearstream, Euroclear, and banks.

KEY CONCEPTS:
- Participants: Institutional entities operating Canton domains
- Jump Cuts: Pre-configured workflow templates for common coordination patterns
- Deal Rooms: Private spaces for contract negotiation and finalization  
- Privacy: Cryptographic protocols ensure transaction confidentiality
- Synchronization: Consistent state across all parties without revealing private data

USER CONTEXT: ${context || 'General Canton Network usage'}

CAPABILITIES:
- Answer questions about Canton Network participants and their roles
- Suggest optimal Jump Cut configurations for workflows
- Explain privacy and synchronization mechanisms
- Guide users through flow building and deal room setup
- Provide fee optimization recommendations
- Help with network administration and governance

Be helpful, concise, and technically accurate. Focus on practical guidance for institutional coordination workflows.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const message = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';
  
  return { message };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return errorResponse(new ValidationError({ message: 'Messages array is required and must not be empty' }));
    }
    
    for (const message of body.messages) {
      if (!message.role || !message.content || !['user', 'assistant'].includes(message.role)) {
        return errorResponse(new ValidationError({ message: 'Each message must have a valid role (user|assistant) and content' }));
      }
    }
    
    const userMessage = body.messages[body.messages.length - 1];
    
    const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
    
    let response: ChatResponse;
    
    if (hasOpenAIKey) {
      try {
        response = await getOpenAIResponse(body.messages, body.context);
      } catch (error) {
        console.error('OpenAI API error:', error);
        response = getMockResponse(userMessage.content, body.context);
      }
    } else {
      response = getMockResponse(userMessage.content, body.context);
    }
    
    return successResponse(response);
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof SyntaxError) {
      return errorResponse(new ValidationError({ message: 'Invalid JSON in request body' }));
    }
    
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process chat request' } },
      { status: 500 }
    );
  }
}