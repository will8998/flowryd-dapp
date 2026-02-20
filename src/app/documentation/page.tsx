"use client";

import { useState, useEffect } from 'react';
import DocLayout, { DocSection } from '@/components/docs/DocLayout';
import DocSidebar from '@/components/docs/DocSidebar';
import DocSearch from '@/components/docs/DocSearch';
import DocContent from '@/components/docs/DocContent';
import CodeBlock from '@/components/docs/CodeBlock';
import DocTableOfContents from '@/components/docs/DocTableOfContents';

const sections: DocSection[] = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'architecture', title: 'Architecture' },
  {
    id: 'authentication',
    title: 'Authentication',
    children: [
      { id: 'jwt-flow', title: 'JWT Flow' },
      { id: 'rbac-system', title: 'RBAC System' },
      { id: 'refresh-tokens', title: 'Refresh Tokens' },
    ],
  },
  {
    id: 'flows',
    title: 'Flows',
    children: [
      { id: 'flow-lifecycle', title: 'Flow Lifecycle' },
      { id: 'builder-ux', title: 'Builder UX' },
      { id: 'templates', title: 'Templates' },
      { id: 'participants', title: 'Participants' },
    ],
  },
  {
    id: 'deals',
    title: 'Deals',
    children: [
      { id: 'deal-lifecycle', title: 'Deal Lifecycle' },
      { id: 'messaging-sse', title: 'Messaging (SSE)' },
      { id: 'file-uploads', title: 'File Uploads' },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    children: [
      { id: 'dashboard', title: 'Dashboard' },
      { id: 'analytics', title: 'Analytics' },
      { id: 'crud-operations', title: 'CRUD Operations' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    children: [
      { id: 'api-authentication', title: 'Authentication' },
      { id: 'api-flows', title: 'Flows' },
      { id: 'api-deals', title: 'Deals' },
      { id: 'api-admin', title: 'Admin' },
      { id: 'api-billing', title: 'Billing' },
      { id: 'api-providers', title: 'Providers' },
    ],
  },
  { id: 'database-schema', title: 'Database Schema' },
  { id: 'canton-integration', title: 'Canton Integration' },
  { id: 'subscriptions-billing', title: 'Subscriptions & Billing' },
  { id: 'deployment', title: 'Deployment' },
];

const searchableSections = sections.flatMap(section => [
  { 
    id: section.id, 
    title: section.title, 
    keywords: [section.title.toLowerCase(), 'flowryd', 'documentation'] 
  },
  ...(section.children || []).map(child => ({
    id: child.id,
    title: child.title,
    keywords: [child.title.toLowerCase(), section.title.toLowerCase(), 'flowryd']
  }))
]);

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [currentHeadings, setCurrentHeadings] = useState<
    { id: string; text: string; level: 2 | 3 }[]
  >([]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sections.some(s => s.id === hash || s.children?.some(c => c.id === hash))) {
      setActiveSection(hash);
    }
  }, []);

  useEffect(() => {
    const updateHeadings = () => {
      const headings = Array.from(document.querySelectorAll('h2, h3')).map(heading => ({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)) as 2 | 3,
      }));
      setCurrentHeadings(headings);
    };

    const timeoutId = setTimeout(updateHeadings, 200);
    return () => clearTimeout(timeoutId);
  }, [activeSection]);

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    window.history.pushState({}, '', `#${id}`);
    
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const renderSidebar = ({ sections, activeSection, onSectionClick }: {
    sections: DocSection[];
    activeSection: string;
    onSectionClick: (id: string) => void;
  }) => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/5">
        <DocSearch sections={searchableSections} onSelect={onSectionClick} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <DocSidebar 
          sections={sections}
          activeSection={activeSection}
          onSectionClick={onSectionClick}
        />
      </div>
    </div>
  );

  const renderTableOfContents = () => (
    <DocTableOfContents headings={currentHeadings} />
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <DocContent sectionId="getting-started">
            <h1 id="getting-started">Getting Started</h1>
            <p>
              Welcome to Flowryd, a Next.js platform for building and managing financial workflows on the Canton Network. 
              This guide will help you understand the core concepts and get started with creating flows and processing deals.
            </p>
            
            <h2 id="core-concepts">Core Concepts</h2>
            <table>
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Description</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Flows</strong></td>
                  <td>Visual workflow templates that define business processes</td>
                  <td>Token issuance, collateral management, repo financing</td>
                </tr>
                <tr>
                  <td><strong>Deals</strong></td>
                  <td>Instances of flows with specific participants and data</td>
                  <td>A specific bond issuance deal worth $10M</td>
                </tr>
                <tr>
                  <td><strong>Participants</strong></td>
                  <td>Canton Network parties involved in workflows</td>
                  <td>Banks, custodians, registries, settlement systems</td>
                </tr>
                <tr>
                  <td><strong>Organizations</strong></td>
                  <td>Groups of users sharing flows and deals</td>
                  <td>Investment banks, asset managers, fintech companies</td>
                </tr>
              </tbody>
            </table>

            <h2 id="authentication">Authentication</h2>
            <p>
              Flowryd uses Canton Network Party-IDs for authentication instead of traditional email/password. 
              Party-IDs follow the format <code>orgname::identifier</code>.
            </p>
            
            <h3 id="register-account">Register an Account</h3>
            <CodeBlock
              code={`POST /api/auth/register
Content-Type: application/json

{
  "partyId": "mybank::trader001",
  "displayName": "John Trader",
  "orgName": "My Investment Bank",
  "email": "john@mybank.com"
}`}
              language="json"
              title="Registration Request"
              copyable={true}
            />

            <h3 id="login">Login</h3>
            <CodeBlock
              code={`POST /api/auth/login
Content-Type: application/json

{
  "partyId": "mybank::trader001"
}

// Response sets httpOnly cookies:
// - flowryd-access-token (15min)
// - flowryd-refresh-token (7 days)`}
              language="json"
              title="Login Request"
              copyable={true}
            />

            <h2 id="your-first-flow">Creating Your First Flow</h2>
            <p>
              Flows are created through the web interface using a visual drag-and-drop builder. 
              Here&apos;s how to create a basic flow programmatically:
            </p>

            <h3 id="create-flow">1. Create Flow</h3>
            <CodeBlock
              code={`POST /api/flows
Content-Type: application/json
Cookie: flowryd-access-token=...

{
  "title": "My First Deal Flow",
  "description": "A simple two-party deal workflow",
  "workflowType": "bilateral-deal"
}`}
              language="json"
              title="Create Flow"
              copyable={true}
            />

            <h3 id="add-version">2. Add Flow Version</h3>
            <CodeBlock
              code={`POST /api/flows/{flowId}/versions
Content-Type: application/json

{
  "nodes": [
    {
      "id": "buyer-node",
      "type": "institutional",
      "position": { "x": 100, "y": 100 },
      "data": {
        "participantId": "buyer-bank",
        "name": "Buyer Bank",
        "cantonRole": "buyer"
      }
    },
    {
      "id": "seller-node", 
      "type": "institutional",
      "position": { "x": 400, "y": 100 },
      "data": {
        "participantId": "seller-bank",
        "name": "Seller Bank",
        "cantonRole": "seller"
      }
    }
  ],
  "edges": [
    {
      "id": "deal-edge",
      "source": "buyer-node",
      "target": "seller-node",
      "type": "liquid"
    }
  ]
}`}
              language="json"
              title="Add Flow Version"
              copyable={true}
            />

            <h3 id="publish-flow">3. Publish Flow</h3>
            <CodeBlock
              code={`POST /api/flows/{flowId}/publish
Content-Type: application/json

{
  "isTemplate": false
}`}
              language="json"
              title="Publish Flow"
              copyable={true}
            />

            <h2 id="create-deal">Creating a Deal</h2>
            <p>
              Once you have a published flow, you can create deals based on that flow:
            </p>
            <CodeBlock
              code={`POST /api/deals
Content-Type: application/json

{
  "title": "Bond Purchase Deal",
  "description": "Purchase of corporate bonds",
  "flowId": "flow-uuid-here",
  "volume": "10000000",
  "metadata": {
    "bondType": "corporate",
    "maturity": "2025-12-31",
    "coupon": "4.5%"
  }
}`}
              language="json"
              title="Create Deal"
              copyable={true}
            />

            <h2 id="deal-messaging">Deal Messaging</h2>
            <p>
              Deals support real-time messaging between participants:
            </p>
            <CodeBlock
              code={`// Send a message
POST /api/deals/{dealId}/messages
{
  "content": "Ready to proceed with settlement",
  "threadId": "settlement-thread"
}

// Listen for real-time updates
GET /api/deals/{dealId}/messages/stream
// Server-Sent Events stream`}
              language="json"
              title="Deal Messaging"
              copyable={true}
            />

            <h2 id="next-steps">Next Steps</h2>
            <ul>
              <li><strong>Architecture</strong> - Learn about the technical architecture and tech stack</li>
              <li><strong>Authentication</strong> - Deep dive into JWT flow and RBAC system</li>
              <li><strong>Flow Lifecycle</strong> - Understand flow states and version management</li>
              <li><strong>Deal Lifecycle</strong> - Learn about deal state transitions</li>
              <li><strong>API Reference</strong> - Complete endpoint documentation</li>
            </ul>

            <div className="note">
              <div className="note-title">Development Environment</div>
              <div className="note-content">
                This documentation assumes you&apos;re running Flowryd locally on <code>http://localhost:3000</code>. 
                All API endpoints are relative to this base URL using Next.js API routes at <code>/api/*</code>.
              </div>
            </div>
          </DocContent>
        );

      case 'api-reference':
        return (
          <DocContent sectionId="api-reference">
            <h1 id="api-reference">API Reference</h1>
            <p>
              Complete reference for all Flowryd API endpoints. All endpoints use Next.js API routes 
              and return consistent JSON responses with proper error handling.
            </p>
            
            <h2 id="base-url">Base URL</h2>
            <CodeBlock
              code="/api"
              language="text"
              title="Base URL (Next.js API Routes)"
              copyable={true}
            />
            
            <h2 id="response-envelope">Response Format</h2>
            <p>All API responses follow a consistent envelope pattern:</p>
            
            <h3 id="success-responses">Success Responses</h3>
            <CodeBlock
              code={`// Standard success response
{
  "data": {
    // Response payload here
  }
}

// Paginated response
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6InV1aWQifQ==",
    "hasMore": true
  }
}`}
              language="json"
              title="Success Response Format"
              copyable={true}
            />

            <h3 id="error-responses">Error Responses</h3>
            <CodeBlock
              code={`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "partyId",
      "issue": "Required field missing"
    }
  }
}`}
              language="json"
              title="Error Response Format"
              copyable={true}
            />

            <h2 id="error-codes">Error Codes</h2>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>HTTP Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>VALIDATION_ERROR</code></td>
                  <td>422</td>
                  <td>Request validation failed</td>
                </tr>
                <tr>
                  <td><code>NOT_FOUND</code></td>
                  <td>404</td>
                  <td>Resource not found</td>
                </tr>
                <tr>
                  <td><code>UNAUTHORIZED</code></td>
                  <td>401</td>
                  <td>Authentication required</td>
                </tr>
                <tr>
                  <td><code>FORBIDDEN</code></td>
                  <td>403</td>
                  <td>Insufficient permissions</td>
                </tr>
                <tr>
                  <td><code>CONFLICT</code></td>
                  <td>409</td>
                  <td>Resource conflict</td>
                </tr>
                <tr>
                  <td><code>INTERNAL_ERROR</code></td>
                  <td>500</td>
                  <td>Server error</td>
                </tr>
              </tbody>
            </table>

            <h2 id="authentication-endpoints">Authentication Endpoints</h2>
            
            <h3 id="post-auth-login">POST /api/auth/login</h3>
            <p>Authenticate user with Canton Network Party-ID and set httpOnly cookies.</p>
            
            <h4>Request Body</h4>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>partyId</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Canton Party-ID (max 195 chars, format: orgname::identifier)</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (200)
{
  "data": {
    "user": {
      "id": "uuid",
      "partyId": "mybank::trader001",
      "displayName": "John Trader",
      "email": "john@mybank.com",
      "role": "editor",
      "orgId": "org-uuid"
    }
  }
}

// Sets httpOnly cookies:
// - flowryd-access-token (15min expiry)
// - flowryd-refresh-token (7 days expiry)`}
              language="json"
              title="Login Response"
              copyable={true}
            />

            <h4>Error Responses</h4>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>401</td>
                  <td>USER_NOT_FOUND</td>
                  <td>User not found, includes redirect: &apos;/register&apos;</td>
                </tr>
                <tr>
                  <td>401</td>
                  <td>ACCOUNT_DEACTIVATED</td>
                  <td>User account is deactivated</td>
                </tr>
              </tbody>
            </table>

            <h3 id="post-auth-register">POST /api/auth/register</h3>
            <p>Register new user and organization. First user in org becomes admin.</p>
            
            <h4>Request Body</h4>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>partyId</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Canton Party-ID (max 195 chars)</td>
                </tr>
                <tr>
                  <td><code>displayName</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>User display name (max 255 chars)</td>
                </tr>
                <tr>
                  <td><code>orgName</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Organization name (max 255 chars)</td>
                </tr>
                <tr>
                  <td><code>email</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Valid email address</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (201)
{
  "data": {
    "user": {
      "id": "uuid",
      "partyId": "mybank::trader001",
      "displayName": "John Trader", 
      "email": "john@mybank.com",
      "role": "admin", // First user gets admin, others get viewer
      "orgId": "org-uuid"
    }
  }
}`}
              language="json"
              title="Registration Response"
              copyable={true}
            />

            <h3 id="post-auth-refresh">POST /api/auth/refresh</h3>
            <p>Refresh access token using refresh token rotation strategy.</p>
            
            <h4>Headers</h4>
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Cookie</code></td>
                  <td>flowryd-refresh-token=...</td>
                  <td>httpOnly refresh token cookie</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (200)
{
  "data": {
    "success": true
  }
}

// Sets new httpOnly cookies with rotated tokens
// Old refresh token is immediately revoked`}
              language="json"
              title="Refresh Response"
              copyable={true}
            />

            <h3 id="post-auth-logout">POST /api/auth/logout</h3>
            <p>Logout user and revoke all refresh tokens.</p>
            
            <h4>Response</h4>
            <CodeBlock
              code={`// Success (200)
{
  "data": {
    "success": true
  }
}

// Clears httpOnly cookies
// Revokes all refresh tokens for user`}
              language="json"
              title="Logout Response"
              copyable={true}
            />

            <h3 id="get-auth-me">GET /api/auth/me</h3>
            <p>Get current authenticated user information.</p>
            
            <h4>Headers</h4>
            <table>
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Cookie</code></td>
                  <td>flowryd-access-token=...</td>
                  <td>httpOnly access token cookie</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (200)
{
  "data": {
    "user": {
      "id": "uuid",
      "partyId": "mybank::trader001",
      "displayName": "John Trader",
      "email": "john@mybank.com", 
      "role": "editor",
      "orgId": "org-uuid"
    }
  }
}`}
              language="json"
              title="Current User Response"
              copyable={true}
            />

            <h2 id="flow-endpoints">Flow Endpoints</h2>
            
            <h3 id="get-flows">GET /api/flows</h3>
            <p>List flows for authenticated user&apos;s organization with pagination.</p>
            
            <h4>Query Parameters</h4>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>limit</code></td>
                  <td>number</td>
                  <td>No</td>
                  <td>Results per page (default: 20, max: 50)</td>
                </tr>
                <tr>
                  <td><code>cursor</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Pagination cursor</td>
                </tr>
                <tr>
                  <td><code>status</code></td>
                  <td>enum</td>
                  <td>No</td>
                  <td>Filter by status: draft, published, archived</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (200)
{
  "data": [
    {
      "id": "flow-uuid",
      "title": "Token Issuance Flow",
      "description": "Automated bond issuance workflow",
      "workflowType": "token-issuance",
      "status": "published",
      "isTemplate": false,
      "isPublic": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z"
    }
  ],
  "pagination": {
    "cursor": "eyJpZCI6InV1aWQifQ==",
    "hasMore": true
  }
}`}
              language="json"
              title="List Flows Response"
              copyable={true}
            />

            <h3 id="post-flows">POST /api/flows</h3>
            <p>Create a new flow. Requires <code>flow.create</code> permission.</p>
            
            <h4>Request Body</h4>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>title</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Flow title (max 255 chars)</td>
                </tr>
                <tr>
                  <td><code>description</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Flow description (max 5000 chars)</td>
                </tr>
                <tr>
                  <td><code>workflowType</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Workflow type identifier (max 64 chars)</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (201)
{
  "data": {
    "flow": {
      "id": "flow-uuid",
      "title": "My New Flow",
      "description": "Flow description",
      "workflowType": "custom",
      "status": "draft",
      "isTemplate": false,
      "isPublic": false,
      "orgId": "org-uuid",
      "createdBy": "user-uuid",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}

// Auto-creates version 1 with empty nodes/edges`}
              language="json"
              title="Create Flow Response"
              copyable={true}
            />

            <h2 id="deal-endpoints">Deal Endpoints</h2>
            
            <h3 id="get-deals">GET /api/deals</h3>
            <p>List deals for authenticated user&apos;s organization with filtering.</p>
            
            <h4>Query Parameters</h4>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>status</code></td>
                  <td>enum</td>
                  <td>No</td>
                  <td>Filter by status: draft, open, negotiating, locked, committed</td>
                </tr>
                <tr>
                  <td><code>limit</code></td>
                  <td>number</td>
                  <td>No</td>
                  <td>Results per page (default: 20, max: 50)</td>
                </tr>
                <tr>
                  <td><code>cursor</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Pagination cursor</td>
                </tr>
              </tbody>
            </table>

            <h3 id="post-deals">POST /api/deals</h3>
            <p>Create a new deal. Requires <code>deal.create</code> permission.</p>
            
            <h4>Request Body</h4>
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>title</code></td>
                  <td>string</td>
                  <td>Yes</td>
                  <td>Deal title (max 255 chars)</td>
                </tr>
                <tr>
                  <td><code>description</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Deal description (max 5000 chars)</td>
                </tr>
                <tr>
                  <td><code>flowId</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>UUID of associated flow</td>
                </tr>
                <tr>
                  <td><code>volume</code></td>
                  <td>string</td>
                  <td>No</td>
                  <td>Deal volume as string (max 64 chars)</td>
                </tr>
                <tr>
                  <td><code>metadata</code></td>
                  <td>object</td>
                  <td>No</td>
                  <td>Additional deal metadata (JSON)</td>
                </tr>
              </tbody>
            </table>

            <h4>Response</h4>
            <CodeBlock
              code={`// Success (201)
{
  "data": {
    "deal": {
      "id": "deal-uuid",
      "title": "Bond Purchase Deal",
      "description": "Corporate bond purchase",
      "status": "draft",
      "volume": "10000000",
      "flowId": "flow-uuid",
      "orgId": "org-uuid",
      "createdBy": "user-uuid",
      "createdAt": "2024-01-15T10:30:00Z",
      "metadata": {
        "bondType": "corporate",
        "maturity": "2025-12-31"
      }
    }
  }
}

// Auto-adds creator as participant with role='admin'`}
              language="json"
              title="Create Deal Response"
              copyable={true}
            />

            <div className="note">
              <div className="note-title">Authentication</div>
              <div className="note-content">
                All endpoints except registration and login require authentication via httpOnly cookies. 
                The middleware automatically validates JWT tokens and adds user context to request headers.
              </div>
            </div>
          </DocContent>
        );

      case 'architecture':
        return (
          <DocContent sectionId="architecture">
            <h1 id="architecture">Architecture</h1>
            <p>
              Flowryd is a Next.js 15 application built for the Canton Network, featuring a modern full-stack 
              architecture with React 19, PostgreSQL, and comprehensive authentication. The system is designed 
              for financial workflow management with real-time messaging and file handling capabilities.
            </p>
            
            <h2 id="tech-stack">Technology Stack</h2>
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Technology</th>
                  <th>Version</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Framework</strong></td>
                  <td>Next.js</td>
                  <td>15</td>
                  <td>Full-stack React framework with App Router</td>
                </tr>
                <tr>
                  <td><strong>Frontend</strong></td>
                  <td>React</td>
                  <td>19</td>
                  <td>Component-based UI with concurrent features</td>
                </tr>
                <tr>
                  <td><strong>Language</strong></td>
                  <td>TypeScript</td>
                  <td>5.x</td>
                  <td>Type-safe JavaScript with enhanced DX</td>
                </tr>
                <tr>
                  <td><strong>Database</strong></td>
                  <td>PostgreSQL</td>
                  <td>15+</td>
                  <td>Relational database with JSONB support</td>
                </tr>
                <tr>
                  <td><strong>ORM</strong></td>
                  <td>Drizzle ORM</td>
                  <td>Latest</td>
                  <td>Type-safe database queries and migrations</td>
                </tr>
                <tr>
                  <td><strong>Authentication</strong></td>
                  <td>JWT (jose)</td>
                  <td>5.x</td>
                  <td>Stateless auth with httpOnly cookies</td>
                </tr>
                <tr>
                  <td><strong>Flow Builder</strong></td>
                  <td>ReactFlow</td>
                  <td>12.x</td>
                  <td>Interactive node-based workflow canvas</td>
                </tr>
                <tr>
                  <td><strong>Styling</strong></td>
                  <td>Tailwind CSS</td>
                  <td>4.x</td>
                  <td>Utility-first CSS framework</td>
                </tr>
                <tr>
                  <td><strong>File Storage</strong></td>
                  <td>Vercel Blob</td>
                  <td>Latest</td>
                  <td>Scalable file uploads and storage</td>
                </tr>
                <tr>
                  <td><strong>Real-time</strong></td>
                  <td>Server-Sent Events</td>
                  <td>Native</td>
                  <td>Real-time deal messaging</td>
                </tr>
              </tbody>
            </table>

            <h2 id="system-architecture">System Architecture</h2>
            <p>Flowryd follows a layered architecture with clear separation of concerns:</p>
            
            <CodeBlock
              code={`┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Pages     │ │ Components  │ │      Hooks          │ │
│  │ (App Router)│ │   (React)   │ │ (State Management)  │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 Middleware Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │    Auth     │ │    RBAC     │ │    Validation       │ │
│  │ (JWT/jose)  │ │   System    │ │   & Sanitization    │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   API Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │    Auth     │ │    Flows    │ │       Deals         │ │
│  │  Endpoints  │ │  Endpoints  │ │     Endpoints       │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Drizzle   │ │ PostgreSQL  │ │   Vercel Blob       │ │
│  │     ORM     │ │ (Database)  │ │  (File Storage)     │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘`}
              language="text"
              title="System Architecture Diagram"
              copyable={true}
            />

            <h2 id="middleware-chain">Middleware Chain</h2>
            <p>Next.js middleware provides a robust request processing pipeline:</p>
            
            <CodeBlock
              code={`// src/middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Extract JWT from httpOnly cookie
  const token = request.cookies.get('flowryd-access-token')?.value;
  
  // 2. Verify JWT signature and claims
  const { payload } = await jwtVerify(token, secret, {
    issuer: 'flowryd',
    audience: 'flowryd-api'
  });
  
  // 3. Add user context to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.sub as string);
  requestHeaders.set('x-user-role', payload.role as string);
  requestHeaders.set('x-user-org-id', payload.orgId as string);
  requestHeaders.set('x-user-party-id', payload.partyId as string);
  
  // 4. Continue to API route with enriched context
  return NextResponse.next({ request: { headers: requestHeaders } });
}`}
              language="typescript"
              title="Middleware Implementation"
              copyable={true}
            />

            <h2 id="api-patterns">API Route Patterns</h2>
            <p>Consistent patterns across all API endpoints:</p>
            
            <CodeBlock
              code={`// API route with middleware chain
export const POST = withMiddleware(
  requireAuth(),           // Authentication check
  requirePermission('flow.create'), // RBAC authorization
  validateRequest(schema), // Input validation
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      // Business logic here
      const result = await businessLogic(ctx.body, ctx.user);
      
      // Success response
      return successResponse(result);
    } catch (error) {
      // Error handling
      return errorResponse(error);
    }
  }
);

// Middleware utilities
const withMiddleware = (...middlewares) => (handler) => {
  return async (req, ctx) => {
    // Execute middleware chain
    for (const middleware of middlewares) {
      const result = await middleware(req, ctx);
      if (result) return result; // Early return on error
    }
    return handler(req, ctx);
  };
};`}
              language="typescript"
              title="API Route Pattern"
              copyable={true}
            />

            <h2 id="database-schema">Database Schema</h2>
            <p>PostgreSQL schema with 13 tables and comprehensive relationships:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Purpose</th>
                  <th>Key Relations</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>organizations</code></td>
                  <td>Multi-tenant organization data</td>
                  <td>→ users, flows, deals</td>
                </tr>
                <tr>
                  <td><code>users</code></td>
                  <td>User accounts with Canton Party-IDs</td>
                  <td>→ organizations, refresh_tokens</td>
                </tr>
                <tr>
                  <td><code>flows</code></td>
                  <td>Workflow templates and configurations</td>
                  <td>→ flow_versions, deals</td>
                </tr>
                <tr>
                  <td><code>flow_versions</code></td>
                  <td>Versioned flow snapshots (JSONB)</td>
                  <td>→ flows</td>
                </tr>
                <tr>
                  <td><code>deals</code></td>
                  <td>Deal instances with state machine</td>
                  <td>→ flows, deal_participants</td>
                </tr>
                <tr>
                  <td><code>deal_messages</code></td>
                  <td>Real-time messaging with threading</td>
                  <td>→ deals, users</td>
                </tr>
                <tr>
                  <td><code>refresh_tokens</code></td>
                  <td>JWT refresh token rotation</td>
                  <td>→ users</td>
                </tr>
                <tr>
                  <td><code>active_sessions</code></td>
                  <td>SSE connection tracking</td>
                  <td>→ users, deals</td>
                </tr>
              </tbody>
            </table>

            <h2 id="data-flow">Request Processing Flow</h2>
            <ol>
              <li><strong>Client Request</strong> - Browser/API client sends HTTP request</li>
              <li><strong>Next.js Middleware</strong> - JWT validation and user context injection</li>
              <li><strong>API Route Handler</strong> - Business logic with middleware chain</li>
              <li><strong>RBAC Check</strong> - Permission validation against user role</li>
              <li><strong>Input Validation</strong> - Request body/query parameter validation</li>
              <li><strong>Database Operations</strong> - Drizzle ORM queries with transactions</li>
              <li><strong>Response Formatting</strong> - Consistent JSON envelope response</li>
              <li><strong>Error Handling</strong> - Structured error responses with codes</li>
            </ol>

            <h2 id="real-time-architecture">Real-time Architecture</h2>
            <p>Server-Sent Events for real-time deal messaging:</p>
            
            <CodeBlock
              code={`// SSE endpoint structure
GET /api/deals/{dealId}/messages/stream

// Connection lifecycle:
1. Client establishes SSE connection
2. Server creates active_sessions entry
3. Polling loop checks for new messages every 3s
4. New messages broadcast to all connected clients
5. Heartbeat every 15s to maintain connection
6. 55s timeout with auto-reconnect expected

// Message broadcasting
const broadcastMessage = async (dealId: string, message: Message) => {
  const sessions = await getActiveSessions(dealId);
  
  sessions.forEach(session => {
    session.controller.enqueue(
      \`data: \${JSON.stringify({ type: 'message', data: message })}\\n\\n\`
    );
  });
};`}
              language="typescript"
              title="Real-time Messaging Architecture"
              copyable={true}
            />

            <h2 id="file-handling">File Upload Architecture</h2>
            <p>Vercel Blob integration for secure file handling:</p>
            
            <CodeBlock
              code={`// File upload flow
POST /api/deals/{dealId}/files

1. Multipart form validation (max 10MB)
2. File type validation (pdf, json, txt, csv, images, docs)
3. Upload to Vercel Blob storage
4. Create deal_messages entry with file metadata
5. Return signed URL for client access

// Supported file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/json', 
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];`}
              language="typescript"
              title="File Upload Architecture"
              copyable={true}
            />

            <h2 id="directory-structure">Directory Structure</h2>
            <table>
              <thead>
                <tr>
                  <th>Directory</th>
                  <th>Purpose</th>
                  <th>Key Files</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>src/app/</code></td>
                  <td>Next.js App Router pages and API routes</td>
                  <td>page.tsx, layout.tsx, api/*/route.ts</td>
                </tr>
                <tr>
                  <td><code>src/components/</code></td>
                  <td>Reusable React components</td>
                  <td>UI components, forms, layouts</td>
                </tr>
                <tr>
                  <td><code>src/lib/</code></td>
                  <td>Shared utilities and business logic</td>
                  <td>auth/, db/, utils/, types/</td>
                </tr>
                <tr>
                  <td><code>src/hooks/</code></td>
                  <td>Custom React hooks</td>
                  <td>useAuth, useDeals, useFlows</td>
                </tr>
                <tr>
                  <td><code>src/db/</code></td>
                  <td>Database schema and configuration</td>
                  <td>schema.ts, migrate.ts, seed.ts</td>
                </tr>
                <tr>
                  <td><code>src/middleware.ts</code></td>
                  <td>Next.js middleware for auth</td>
                  <td>JWT validation, user context</td>
                </tr>
              </tbody>
            </table>

            <h2 id="deployment-architecture">Deployment Architecture</h2>
            <p>Production deployment on DigitalOcean with PM2 process management:</p>
            
            <ul>
              <li><strong>Frontend &amp; API</strong> - Next.js 15 on DigitalOcean droplet (Ubuntu)</li>
              <li><strong>Process Manager</strong> - PM2 with auto-restart and clustering</li>
              <li><strong>Reverse Proxy</strong> - Nginx (port 3002 &rarr; 3001)</li>
              <li><strong>Database</strong> - PostgreSQL via Drizzle ORM</li>
              <li><strong>File Storage</strong> - Vercel Blob for file uploads</li>
              <li><strong>Runtime</strong> - Node.js 20+, TypeScript</li>
            </ul>

            <div className="note">
              <div className="note-title">Canton Network Integration</div>
              <div className="note-content">
                While Flowryd is designed for Canton Network workflows, the current implementation 
                focuses on the application layer. Canton Network integration for actual transaction 
                processing would be added as an additional service layer.
              </div>
            </div>
          </DocContent>
        );

      case 'jwt-flow':
        return (
          <DocContent sectionId="jwt-flow">
            <h1 id="jwt-flow">JWT Authentication Flow</h1>
            <p>
              Flowryd uses a secure JWT-based authentication system with httpOnly cookies 
              and refresh token rotation for enhanced security.
            </p>
            <h2 id="login-process">Login Process</h2>
            <p>Authentication is based on Canton Network Party-IDs rather than traditional email/password:</p>
            <CodeBlock
              code={`// Login request
POST /api/auth/login
{
  "partyId": "party123::participant456"
}

// Successful response
{
  "data": {
    "user": {
      "id": "uuid",
      "partyId": "party123::participant456",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "orgId": "org-uuid"
    }
  }
}

// Sets httpOnly cookies:
// - flowryd-access-token (15min expiry)
// - flowryd-refresh-token (7 days expiry)`}
              language="json"
              title="Login Flow"
            />
            <h2 id="token-creation">Token Creation</h2>
            <p>Access tokens are created using the jose library with configurable signing algorithms:</p>
            <CodeBlock
              code={`import { SignJWT } from 'jose';

export async function signAccessToken(payload: {
  sub: string;
  partyId: string;
  role: UserRole;
  orgId: string;
}) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // or RS256 for production
    .setIssuedAt()
    .setIssuer('flowryd')
    .setAudience('flowryd-api')
    .setExpirationTime('15m')
    .sign(secret);
}`}
              language="typescript"
              title="src/lib/auth/jwt.ts"
            />
            <h2 id="cookie-settings">Cookie Configuration</h2>
            <p>Security-first cookie settings ensure tokens are protected:</p>
            <CodeBlock
              code={`export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  // Access token (15 minutes)
  cookies().set('flowryd-access-token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60, // 15 minutes
  });

  // Refresh token (7 days)
  cookies().set('flowryd-refresh-token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}`}
              language="typescript"
              title="src/lib/auth/session.ts"
            />
            <h2 id="middleware-enforcement">Middleware Enforcement</h2>
            <p>The Next.js middleware validates tokens on every request:</p>
            <CodeBlock
              code={`export async function middleware(request: NextRequest) {
  const token = request.cookies.get('flowryd-access-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'flowryd',
    });

    // Add user context to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-role', payload['role'] as string);
    requestHeaders.set('x-user-org-id', payload['orgId'] as string);
    requestHeaders.set('x-user-party-id', payload['partyId'] as string);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}`}
              language="typescript"
              title="src/middleware.ts"
            />
          </DocContent>
        );

      case 'rbac-system':
        return (
          <DocContent sectionId="rbac-system">
            <h1 id="rbac-system">Role-Based Access Control (RBAC)</h1>
            <p>
              Flowryd implements a comprehensive RBAC system with three primary roles 
              and granular permissions for different operations.
            </p>
            <h2 id="user-roles">User Roles</h2>
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                  <th>Typical Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>admin</code></td>
                  <td>Full system access and management capabilities</td>
                  <td>Organization owners, system administrators</td>
                </tr>
                <tr>
                  <td><code>editor</code></td>
                  <td>Can create and modify flows and deals</td>
                  <td>Flow designers, deal managers</td>
                </tr>
                <tr>
                  <td><code>viewer</code></td>
                  <td>Read-only access to flows and deals</td>
                  <td>Stakeholders, observers, new users</td>
                </tr>
              </tbody>
            </table>
            <h2 id="permission-matrix">Permission Matrix</h2>
            <table>
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Admin</th>
                  <th>Editor</th>
                  <th>Viewer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>flow.create</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>flow.edit</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>flow.delete</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>flow.publish</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>flow.manage_templates</code></td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>deal.create</code></td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>deal.status_change</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>deal.send_message</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>deal.read_messages</code></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td><code>admin.manage_users</code></td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><code>admin.view_audit</code></td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
              </tbody>
            </table>
            <h2 id="permission-enforcement">Permission Enforcement</h2>
            <p>Permissions are enforced at both the API and UI levels:</p>
            <CodeBlock
              code={`import { requirePermission, hasPermission } from '@/lib/auth/rbac';

// API Route Protection
export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    // Throws ForbiddenError if user lacks permission
    requirePermission(ctx.user!.role, 'flow.create');
    
    // Continue with flow creation...
  }
);

// UI Component Protection
function CreateFlowButton() {
  const { user } = useCantonAuth();
  
  if (!user || !hasPermission(user.role, 'flow.create')) {
    return null; // Hide button if no permission
  }
  
  return <button onClick={createFlow}>Create Flow</button>;
}`}
              language="typescript"
              title="Permission Enforcement Examples"
            />
            <h2 id="role-assignment">Role Assignment</h2>
            <p>Roles are assigned during registration and can be modified by admins:</p>
            <CodeBlock
              code={`// First user in organization becomes admin
const [userCount] = await db
  .select({ value: count() })
  .from(users)
  .where(eq(users.orgId, orgId));

const role = userCount.value === 0 ? 'admin' : 'viewer';

await db.insert(users).values({
  partyId,
  orgId,
  displayName,
  role, // Assigned based on organization status
  // ...other fields
});`}
              language="typescript"
              title="src/app/api/auth/register/route.ts"
            />
          </DocContent>
        );

      case 'refresh-tokens':
        return (
          <DocContent sectionId="refresh-tokens">
            <h1 id="refresh-tokens">Refresh Token System</h1>
            <p>
              Flowryd implements a secure refresh token rotation strategy to maintain 
              user sessions while minimizing security risks from token compromise.
            </p>
            <h2 id="token-rotation">Token Rotation Strategy</h2>
            <p>Every refresh operation generates new tokens and invalidates the old ones:</p>
            <CodeBlock
              code={`// Refresh token flow
1. Client sends refresh token via httpOnly cookie
2. Server validates token and checks for reuse
3. If valid, server generates new access + refresh tokens
4. Old refresh token is immediately revoked
5. New tokens are sent back via httpOnly cookies

// Token reuse detection
- If a revoked token is used, entire token family is revoked
- Prevents replay attacks and token theft scenarios`}
              language="text"
              title="Refresh Token Rotation"
            />
            <h2 id="refresh-endpoint">Refresh Endpoint Implementation</h2>
            <CodeBlock
              code={`export async function POST(req: NextRequest) {
  const token = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'No refresh token' } },
      { status: 401 }
    );
  }

  // Verify and decode refresh token
  const payload = await verifyRefreshToken(token);
  const tokenHash = await hashToken(token);

  // Check if token exists and is not revoked
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.userId, payload.sub),
        isNull(refreshTokens.revokedAt)
      )
    );

  if (!storedToken) {
    // Token reuse detected - revoke entire family
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenFamily, payload.tokenFamily));
    
    return NextResponse.json(
      { error: { code: 'TOKEN_REUSE', message: 'Token reuse detected' } },
      { status: 401 }
    );
  }

  // Revoke current token
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, storedToken.id));

  // Generate new tokens
  const newAccessToken = await signAccessToken({
    sub: user.id,
    partyId: user.partyId,
    role: user.role,
    orgId: user.orgId,
  });
  const newRefreshToken = await signRefreshToken(user.id, payload.tokenFamily);

  // Store new refresh token
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: await hashToken(newRefreshToken),
    tokenFamily: payload.tokenFamily,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await setAuthCookies(newAccessToken, newRefreshToken);
  return NextResponse.json({ data: { success: true } });
}`}
              language="typescript"
              title="src/app/api/auth/refresh/route.ts"
            />
            <h2 id="token-expiration">Token Expiration</h2>
            <table>
              <thead>
                <tr>
                  <th>Token Type</th>
                  <th>Expiration</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Access Token</td>
                  <td>15 minutes</td>
                  <td>Short-lived for API authentication</td>
                </tr>
                <tr>
                  <td>Refresh Token</td>
                  <td>7 days</td>
                  <td>Long-lived for session renewal</td>
                </tr>
              </tbody>
            </table>
            <h2 id="frontend-handling">Frontend Token Handling</h2>
            <p>The frontend automatically handles token refresh:</p>
            <CodeBlock
              code={`// Automatic token refresh on API errors
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let response = await fetch(url, options);
  
  if (response.status === 401) {
    // Try to refresh token
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
    });
    
    if (refreshResponse.ok) {
      // Retry original request
      response = await fetch(url, options);
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }
  
  return response;
};`}
              language="typescript"
              title="Frontend Token Refresh"
            />
            <h2 id="security-features">Security Features</h2>
            <ul>
              <li><strong>Token Family</strong> - Groups related tokens for family-wide revocation</li>
              <li><strong>Reuse Detection</strong> - Automatically detects and prevents token replay attacks</li>
              <li><strong>Automatic Cleanup</strong> - Expired tokens are cleaned up periodically</li>
              <li><strong>httpOnly Cookies</strong> - Tokens are not accessible to JavaScript</li>
              <li><strong>Secure Transmission</strong> - HTTPS-only in production</li>
            </ul>
          </DocContent>
        );

      case 'flow-lifecycle':
        return (
          <DocContent sectionId="flow-lifecycle">
            <h1 id="flow-lifecycle">Flow Lifecycle</h1>
            <p>
              Flows in Flowryd progress through distinct states with versioning support 
              and comprehensive audit trails.
            </p>
            <h2 id="flow-states">Flow States</h2>
            <table>
              <thead>
                <tr>
                  <th>State</th>
                  <th>Description</th>
                  <th>Allowed Transitions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>draft</code></td>
                  <td>Flow is being designed and configured</td>
                  <td>→ published, → archived</td>
                </tr>
                <tr>
                  <td><code>published</code></td>
                  <td>Flow is active and can be used for deals</td>
                  <td>→ archived</td>
                </tr>
                <tr>
                  <td><code>archived</code></td>
                  <td>Flow is inactive but preserved for history</td>
                  <td>→ published (admin only)</td>
                </tr>
              </tbody>
            </table>
            <h2 id="version-management">Version Management</h2>
            <p>Flows use append-only versioning with JSONB snapshots:</p>
            <CodeBlock
              code={`// Flow version structure
interface FlowVersion {
  id: string;
  flowId: string;
  version: number;        // Auto-incrementing version number
  nodes: unknown[];       // ReactFlow nodes (JSONB)
  edges: unknown[];       // ReactFlow edges (JSONB)
  viewport: {             // Canvas viewport state
    x: number;
    y: number;
    zoom: number;
  } | null;
  snapshotName?: string;  // Optional user-defined name
  createdBy: string;      // User who created this version
  createdAt: Date;        // Timestamp
}

// Creating a new version
const [newVersion] = await db
  .insert(flowVersions)
  .values({
    flowId: flow.id,
    version: currentVersion + 1,
    nodes: updatedNodes,
    edges: updatedEdges,
    viewport: canvasViewport,
    createdBy: user.id,
  })
  .returning();`}
              language="typescript"
              title="Flow Version Schema"
            />
            <h2 id="flow-creation">Flow Creation Process</h2>
            <CodeBlock
              code={`// 1. Create flow record
const [flow] = await db
  .insert(flows)
  .values({
    orgId: user.orgId,
    title: 'New Flow',
    description: 'Flow description',
    workflowType: 'custom',
    status: 'draft',
    createdBy: user.id,
    updatedBy: user.id,
  })
  .returning();

// 2. Create initial version (v1)
await db.insert(flowVersions).values({
  flowId: flow.id,
  version: 1,
  nodes: [],           // Empty canvas
  edges: [],
  createdBy: user.id,
});

// 3. Log audit trail
logAudit({
  userId: user.id,
  orgId: user.orgId,
  action: 'flow.create',
  resourceType: 'flow',
  resourceId: flow.id,
});`}
              language="typescript"
              title="Flow Creation"
            />
            <h2 id="publishing-flows">Publishing Flows</h2>
            <p>Publishing makes flows available for deal creation:</p>
            <CodeBlock
              code={`// Publish flow endpoint
POST /api/flows/{flowId}/publish

// Implementation
export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.publish');
    
    const { flowId } = ctx.params;
    
    // Update flow status
    const [updatedFlow] = await db
      .update(flows)
      .set({ 
        status: 'published',
        updatedBy: ctx.user!.sub,
        updatedAt: new Date()
      })
      .where(eq(flows.id, flowId))
      .returning();
    
    // Audit log
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.publish',
      resourceType: 'flow',
      resourceId: flowId,
    });
    
    return successResponse({ flow: updatedFlow });
  }
);`}
              language="typescript"
              title="Flow Publishing"
            />
            <h2 id="template-system">Template System</h2>
            <p>Flows can be converted to templates for reuse:</p>
            <CodeBlock
              code={`// Convert flow to template (admin only)
await db
  .update(flows)
  .set({ 
    isTemplate: true,
    isPublic: true,  // Templates can be public
    status: 'published'
  })
  .where(eq(flows.id, flowId));

// Template metadata
interface FlowTemplate {
  id: string;
  title: string;
  description: string;
  workflowType: string;
  isTemplate: true;
  isPublic: boolean;
  isFeatured?: boolean;
  featuredHeadline?: string;
  featuredSource?: string;
}`}
              language="typescript"
              title="Template System"
            />
          </DocContent>
        );

      case 'builder-ux':
        return (
          <DocContent sectionId="builder-ux">
            <h1 id="builder-ux">Flow Builder UX</h1>
            <p>
              The flow builder provides an intuitive drag-and-drop interface for designing 
              complex financial workflows using ReactFlow canvas technology.
            </p>
            <h2 id="canvas-technology">Canvas Technology</h2>
            <p>Built on @xyflow/react for professional flow editing:</p>
            <CodeBlock
              code={`import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function FlowBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={customNodeTypes}
        edgeTypes={customEdgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}`}
              language="typescript"
              title="Flow Builder Component"
            />
            <h2 id="participant-tray">Participant Tray</h2>
            <p>Drag participants from the tray onto the canvas:</p>
            <CodeBlock
              code={`// Participant tray with Canton Network participants
const ParticipantTray = () => {
  const participants = useMemo(() => 
    cantonParticipants.filter(p => 
      p.criticality === 'CRITICAL' || p.criticality === 'REQUIRED'
    ), []
  );

  const onDragStart = (event: DragEvent, participant: Participant) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'institutional',
      data: {
        participantId: participant.id,
        name: participant.name,
        cantonRole: participant.cantonRole,
        capabilities: participant.capabilities,
      }
    }));
  };

  return (
    <div className="participant-tray">
      {participants.map(participant => (
        <div
          key={participant.id}
          draggable
          onDragStart={(e) => onDragStart(e, participant)}
          className="participant-card"
        >
          <div className="participant-name">{participant.name}</div>
          <div className="participant-role">{participant.cantonRole}</div>
        </div>
      ))}
    </div>
  );
};`}
              language="typescript"
              title="Participant Tray"
            />
            <h2 id="node-types">Node Types</h2>
            <table>
              <thead>
                <tr>
                  <th>Node Type</th>
                  <th>Purpose</th>
                  <th>Visual Style</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>institutional</code></td>
                  <td>Canton Network participants</td>
                  <td>Rounded rectangles with participant branding</td>
                </tr>
                <tr>
                  <td><code>process</code></td>
                  <td>Workflow steps and operations</td>
                  <td>Diamond shapes for decision points</td>
                </tr>
                <tr>
                  <td><code>data</code></td>
                  <td>Data sources and outputs</td>
                  <td>Cylindrical database icons</td>
                </tr>
              </tbody>
            </table>
            <h2 id="edge-types">Edge Types</h2>
            <CodeBlock
              code={`const customEdgeTypes = {
  liquid: LiquidEdge,     // Animated flow for liquidity
  settlement: SettlementEdge, // Dashed lines for settlement
  data: DataEdge,         // Dotted lines for data flow
  collateral: CollateralEdge, // Thick lines for collateral
};

// Animated liquid edge
const LiquidEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  return (
    <g>
      <path
        d={\`M\${sourceX},\${sourceY} L\${targetX},\${targetY}\`}
        stroke="#00ff88"
        strokeWidth={3}
        fill="none"
        className="animate-pulse"
      />
      <circle r={4} fill="#00ff88">
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path={\`M\${sourceX},\${sourceY} L\${targetX},\${targetY}\`}
        />
      </circle>
    </g>
  );
};`}
              language="typescript"
              title="Custom Edge Types"
            />
            <h2 id="keyboard-shortcuts">Keyboard Shortcuts</h2>
            <table>
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd>⌘</kbd> + <kbd>S</kbd></td>
                  <td>Save</td>
                  <td>Save current flow version</td>
                </tr>
                <tr>
                  <td><kbd>⌘</kbd> + <kbd>Z</kbd></td>
                  <td>Undo</td>
                  <td>Undo last action</td>
                </tr>
                <tr>
                  <td><kbd>⇧</kbd> + <kbd>⌘</kbd> + <kbd>Z</kbd></td>
                  <td>Redo</td>
                  <td>Redo last undone action</td>
                </tr>
                <tr>
                  <td><kbd>Delete</kbd></td>
                  <td>Delete</td>
                  <td>Delete selected nodes/edges</td>
                </tr>
                <tr>
                  <td><kbd>⌘</kbd> + <kbd>A</kbd></td>
                  <td>Select All</td>
                  <td>Select all nodes and edges</td>
                </tr>
                <tr>
                  <td><kbd>Space</kbd> + <kbd>Drag</kbd></td>
                  <td>Pan</td>
                  <td>Pan around the canvas</td>
                </tr>
              </tbody>
            </table>
            <h2 id="auto-save">Auto-Save System</h2>
            <CodeBlock
              code={`// Auto-save implementation
const useAutoSave = (flowId: string, nodes: Node[], edges: Edge[]) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const saveVersion = useCallback(async () => {
    if (!flowId || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(\`/api/flows/\${flowId}/versions\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodes, 
          edges,
          viewport: getViewport()
        }),
      });
      
      if (response.ok) {
        setLastSaved(new Date());
      }
    } finally {
      setIsSaving(false);
    }
  }, [flowId, nodes, edges, isSaving]);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveVersion, 30000);
    return () => clearInterval(interval);
  }, [saveVersion]);
  
  return { lastSaved, isSaving, saveVersion };
};`}
              language="typescript"
              title="Auto-Save Hook"
            />
          </DocContent>
        );

      case 'templates':
        return (
          <DocContent sectionId="templates">
            <h1 id="templates">Flow Templates</h1>
            <p>
              Templates provide pre-built flow configurations for common Canton Network 
              workflows, enabling rapid deployment of proven financial processes.
            </p>
            <h2 id="template-system">Template System</h2>
            <p>Templates are flows marked with special flags for reuse:</p>
            <CodeBlock
              code={`// Template flow properties
interface FlowTemplate extends Flow {
  isTemplate: true;        // Marks flow as template
  isPublic: boolean;       // Public templates visible to all orgs
  isFeatured?: boolean;    // Featured on template gallery
  featuredHeadline?: string; // Marketing headline
  featuredSource?: string;   // Source attribution
}

// Query templates
const templates = await db
  .select()
  .from(flows)
  .where(
    and(
      eq(flows.isTemplate, true),
      eq(flows.status, 'published'),
      or(
        eq(flows.isPublic, true),
        eq(flows.orgId, user.orgId) // Private org templates
      )
    )
  )
  .orderBy(desc(flows.isFeatured), desc(flows.createdAt));`}
              language="typescript"
              title="Template Query"
            />
            <h2 id="built-in-templates">Built-in Templates</h2>
            <table>
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Description</th>
                  <th>Key Participants</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Token Issuance</td>
                  <td>Issue digital bonds or funds with automated lifecycle</td>
                  <td>Issuer, Registry, Settlement, Custody</td>
                </tr>
                <tr>
                  <td>Collateral Management</td>
                  <td>Automate collateral selection and mobility</td>
                  <td>Collateral Agent, Custody, Registry</td>
                </tr>
                <tr>
                  <td>Repo Financing</td>
                  <td>Intraday repo swaps with atomic settlement</td>
                  <td>Cash Lender, Repo Platform, Custody</td>
                </tr>
                <tr>
                  <td>Securities Lending</td>
                  <td>Automated securities lending with EquiLend 1Source</td>
                  <td>EquiLend, Custody, Collateral Agent</td>
                </tr>
                <tr>
                  <td>Syndicated Loans</td>
                  <td>Multi-party loan syndication via Versana</td>
                  <td>Versana, Registry, Settlement</td>
                </tr>
              </tbody>
            </table>
            <h2 id="creating-templates">Creating Templates</h2>
            <p>Admins can convert any published flow into a template:</p>
            <CodeBlock
              code={`// Convert flow to template (admin only)
export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.manage_templates');
    
    const { flowId } = ctx.params;
    const { isPublic, featuredHeadline, featuredSource } = ctx.body;
    
    const [template] = await db
      .update(flows)
      .set({
        isTemplate: true,
        isPublic: isPublic || false,
        isFeatured: !!featuredHeadline,
        featuredHeadline,
        featuredSource,
        updatedBy: ctx.user!.sub,
        updatedAt: new Date(),
      })
      .where(eq(flows.id, flowId))
      .returning();
    
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.template_create',
      resourceType: 'flow',
      resourceId: flowId,
    });
    
    return successResponse({ template });
  }
);`}
              language="typescript"
              title="Template Creation API"
            />
            <h2 id="using-templates">Using Templates</h2>
            <p>Users can create new flows from templates:</p>
            <CodeBlock
              code={`// Create flow from template
const createFromTemplate = async (templateId: string, customization: {
  title: string;
  description?: string;
  workflowType?: string;
}) => {
  // 1. Get template flow and latest version
  const template = await getFlow(templateId);
  const latestVersion = await getLatestVersion(templateId);
  
  // 2. Create new flow
  const [newFlow] = await db
    .insert(flows)
    .values({
      orgId: user.orgId,
      title: customization.title,
      description: customization.description,
      workflowType: customization.workflowType || template.workflowType,
      status: 'draft',
      createdBy: user.id,
      updatedBy: user.id,
    })
    .returning();
  
  // 3. Copy template version as initial version
  await db.insert(flowVersions).values({
    flowId: newFlow.id,
    version: 1,
    nodes: latestVersion.nodes,     // Copy nodes
    edges: latestVersion.edges,     // Copy edges
    viewport: latestVersion.viewport,
    snapshotName: 'From Template',
    createdBy: user.id,
  });
  
  return newFlow;
};`}
              language="typescript"
              title="Template Usage"
            />
            <h2 id="template-gallery">Template Gallery</h2>
            <p>The template gallery showcases featured templates:</p>
            <CodeBlock
              code={`function TemplateGallery() {
  const { templates, isLoading } = useTemplates();
  
  const featuredTemplates = templates.filter(t => t.isFeatured);
  const regularTemplates = templates.filter(t => !t.isFeatured);
  
  return (
    <div className="template-gallery">
      {featuredTemplates.length > 0 && (
        <section className="featured-section">
          <h2>Featured Templates</h2>
          <div className="featured-grid">
            {featuredTemplates.map(template => (
              <FeaturedTemplateCard 
                key={template.id} 
                template={template}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </section>
      )}
      
      <section className="all-templates">
        <h2>All Templates</h2>
        <div className="template-grid">
          {regularTemplates.map(template => (
            <TemplateCard 
              key={template.id} 
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      </section>
    </div>
  );
}`}
              language="typescript"
              title="Template Gallery Component"
            />
          </DocContent>
        );

      case 'participants':
        return (
          <DocContent sectionId="participants">
            <h1 id="participants">Canton Network Participants</h1>
            <p>
              Flowryd integrates with the Canton Network ecosystem, providing access to 
              100+ institutional participants across banking, custody, liquidity, and infrastructure.
            </p>
            <h2 id="participant-system">Participant System</h2>
            <p>Participants are categorized by their Canton Network roles and capabilities:</p>
            <CodeBlock
              code={`interface Participant {
  id: string;                    // Unique participant identifier
  name: string;                  // Display name
  cantonRole: string;           // Primary role on Canton Network
  capabilities: {               // Specific capabilities
    [key: string]: number;      // Capability level (0-1)
  };
  criticality: 'CRITICAL' | 'REQUIRED' | 'OPTIONAL';
  holdings?: string;            // Assets under management
  validatorNodes?: number;      // Number of validator nodes
  superValidator?: boolean;     // Super validator status
  description?: string;         // Participant description
}

// Example participant
{
  id: "p_dtcc",
  name: "DTCC",
  cantonRole: "Registry + Issuer",
  capabilities: { 
    Registry: 1, 
    Settlement: 1 
  },
  criticality: "CRITICAL",
  holdings: "$45.2T",
  validatorNodes: 4,
  description: "Premier post-trade market infrastructure"
}`}
              language="typescript"
              title="Participant Data Structure"
            />
            <h2 id="participant-categories">Participant Categories</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Examples</th>
                  <th>Primary Capabilities</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Registry & Settlement</td>
                  <td>DTCC, Euroclear</td>
                  <td>Registry, Settlement, Collateral_Agent</td>
                </tr>
                <tr>
                  <td>Banking & Custody</td>
                  <td>BNY Mellon, Standard Chartered</td>
                  <td>Custody, Cash_Lender, Collateral_Provider</td>
                </tr>
                <tr>
                  <td>Exchanges</td>
                  <td>HKEX, Nasdaq, Tradeweb</td>
                  <td>Exchange, Settlement</td>
                </tr>
                <tr>
                  <td>Liquidity Providers</td>
                  <td>Cumberland, Citadel, DRW</td>
                  <td>Liquidity_Provider, Market_Maker</td>
                </tr>
                <tr>
                  <td>Asset Managers</td>
                  <td>BlackRock, Franklin Templeton</td>
                  <td>Issuer, Collateral_Provider</td>
                </tr>
                <tr>
                  <td>Stablecoin Issuers</td>
                  <td>Circle, Paxos</td>
                  <td>Issuer, Settlement, Payment_Stablecoin</td>
                </tr>
                <tr>
                  <td>Infrastructure</td>
                  <td>Digital Asset, Blockdaemon</td>
                  <td>Orchestration, Infrastructure, Staking</td>
                </tr>
              </tbody>
            </table>
            <h2 id="party-id-system">Party-ID System</h2>
            <p>Canton Network uses Party-IDs for participant identification:</p>
            <CodeBlock
              code={`// Party-ID format: party::participant
// Examples:
"dtcc_main::dtcc_participant_node_1"
"cumberland_trading::cumberland_validator_8"
"digital_asset_orchestrator::da_canton_node_32"

// Party-ID validation
export function validatePartyId(partyId: string): {
  valid: boolean;
  error?: string;
} {
  if (!partyId || typeof partyId !== 'string') {
    return { valid: false, error: 'Party-ID is required' };
  }
  
  if (partyId.length < 3) {
    return { valid: false, error: 'Party-ID too short' };
  }
  
  if (partyId.length > 195) {
    return { valid: false, error: 'Party-ID too long' };
  }
  
  // Must contain :: separator
  if (!partyId.includes('::')) {
    return { valid: false, error: 'Invalid Party-ID format' };
  }
  
  return { valid: true };
}`}
              language="typescript"
              title="Party-ID System"
            />
            <h2 id="adding-participants">Adding Participants to Flows</h2>
            <p>Participants are added to flows through drag-and-drop or programmatically:</p>
            <CodeBlock
              code={`// Add participant to flow canvas
const addParticipantToFlow = async (
  flowId: string, 
  participantId: string, 
  position: { x: number; y: number }
) => {
  // 1. Create flow participant record
  await db.insert(flowParticipants).values({
    flowId,
    participantId,
    nodeId: \`node_\${nanoid()}\`,
    positionX: position.x,
    positionY: position.y,
    addedBy: user.id,
  });
  
  // 2. Add to canvas nodes
  const participant = participants.find(p => p.id === participantId);
  const newNode = {
    id: \`node_\${nanoid()}\`,
    type: 'institutional',
    position,
    data: {
      participantId,
      name: participant.name,
      cantonRole: participant.cantonRole,
      capabilities: participant.capabilities,
      criticality: participant.criticality,
    },
  };
  
  setNodes(nodes => [...nodes, newNode]);
};

// Drag and drop handler
const onDrop = useCallback((event: DragEvent) => {
  event.preventDefault();
  
  const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  const participantData = JSON.parse(
    event.dataTransfer.getData('application/reactflow')
  );
  
  const position = reactFlowInstance.project({
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  });
  
  addParticipantToFlow(flowId, participantData.participantId, position);
}, [flowId, reactFlowInstance]);`}
              language="typescript"
              title="Adding Participants to Flows"
            />
            <h2 id="participant-capabilities">Capability Matching</h2>
            <p>Flows can validate participant capabilities against requirements:</p>
            <CodeBlock
              code={`// Capability validation
const validateFlowParticipants = (
  flowParticipants: FlowParticipant[],
  requiredCapabilities: string[]
) => {
  const availableCapabilities = new Set<string>();
  
  flowParticipants.forEach(fp => {
    const participant = participants.find(p => p.id === fp.participantId);
    if (participant) {
      Object.keys(participant.capabilities).forEach(cap => {
        if (participant.capabilities[cap] > 0) {
          availableCapabilities.add(cap);
        }
      });
    }
  });
  
  const missingCapabilities = requiredCapabilities.filter(
    cap => !availableCapabilities.has(cap)
  );
  
  return {
    valid: missingCapabilities.length === 0,
    missingCapabilities,
    availableCapabilities: Array.from(availableCapabilities),
  };
};

// Example usage
const validation = validateFlowParticipants(flowParticipants, [
  'Registry',
  'Settlement', 
  'Custody',
  'Liquidity_Provider'
]);

if (!validation.valid) {
  console.warn('Missing capabilities:', validation.missingCapabilities);
}`}
              language="typescript"
              title="Capability Validation"
            />
          </DocContent>
        );

      case 'deal-lifecycle':
        return (
          <DocContent sectionId="deal-lifecycle">
            <h1 id="deal-lifecycle">Deal Lifecycle</h1>
            <p>
              Deals progress through a structured state machine with strict transition rules 
              and role-based permissions for state changes.
            </p>
            <h2 id="deal-states">Deal States</h2>
            <table>
              <thead>
                <tr>
                  <th>State</th>
                  <th>Description</th>
                  <th>Who Can Transition</th>
                  <th>Next States</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>DRAFT</code></td>
                  <td>Deal is being configured</td>
                  <td>Admin, Editor</td>
                  <td>OPEN</td>
                </tr>
                <tr>
                  <td><code>OPEN</code></td>
                  <td>Deal is available for participation</td>
                  <td>Admin, Editor</td>
                  <td>NEGOTIATING, DRAFT (admin)</td>
                </tr>
                <tr>
                  <td><code>NEGOTIATING</code></td>
                  <td>Active negotiation (≥2 participants)</td>
                  <td>Admin, Editor</td>
                  <td>LOCKED, OPEN</td>
                </tr>
                <tr>
                  <td><code>LOCKED</code></td>
                  <td>Terms locked, pending commitment</td>
                  <td>Admin only</td>
                  <td>COMMITTED, NEGOTIATING</td>
                </tr>
                <tr>
                  <td><code>COMMITTED</code></td>
                  <td>Deal finalized and executed</td>
                  <td>Admin only</td>
                  <td>None (terminal)</td>
                </tr>
              </tbody>
            </table>
            <h2 id="state-transitions">State Transition Rules</h2>
            <CodeBlock
              code={`// Deal state transition validation
const validateStateTransition = async (
  currentState: DealStatus,
  newState: DealStatus,
  userRole: UserRole,
  dealId: string
) => {
  // Admin can reset any deal to DRAFT
  if (userRole === 'admin' && newState === 'draft') {
    return { valid: true };
  }
  
  // Check role permissions
  if (newState === 'locked' || newState === 'committed') {
    if (userRole !== 'admin') {
      throw new ForbiddenError('Only admins can lock or commit deals');
    }
  }
  
  // Validate transition logic
  const validTransitions: Record<DealStatus, DealStatus[]> = {
    draft: ['open'],
    open: ['negotiating', 'draft'],
    negotiating: ['locked', 'open'],
    locked: ['committed', 'negotiating'],
    committed: [], // Terminal state
  };
  
  if (!validTransitions[currentState].includes(newState)) {
    throw new ValidationError(
      \`Invalid transition from \${currentState} to \${newState}\`
    );
  }
  
  // NEGOTIATING requires at least 2 participants
  if (newState === 'negotiating') {
    const participantCount = await db
      .select({ count: count() })
      .from(dealParticipants)
      .where(eq(dealParticipants.dealId, dealId));
    
    if (participantCount[0].count < 2) {
      throw new ValidationError(
        'NEGOTIATING state requires at least 2 participants'
      );
    }
  }
  
  return { valid: true };
};`}
              language="typescript"
              title="State Transition Validation"
            />
            <h2 id="deal-creation">Deal Creation</h2>
            <CodeBlock
              code={`// Create new deal
POST /api/deals
{
  "title": "Bond Issuance Deal",
  "description": "Corporate bond issuance workflow",
  "flowId": "flow-uuid",
  "volume": "100M",
  "metadata": {
    "bondType": "corporate",
    "maturity": "5Y",
    "currency": "USD"
  }
}

// Implementation
export const POST = withMiddleware(
  requireAuth(),
  validateBody(createDealSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.create');
    
    const [deal] = await db
      .insert(deals)
      .values({
        orgId: ctx.user!.orgId,
        title: body.title,
        description: body.description,
        flowId: body.flowId,
        volume: body.volume,
        metadata: body.metadata ?? null,
        status: 'draft', // Always starts as draft
        createdBy: ctx.user!.sub,
      })
      .returning();
    
    // Add creator as admin participant
    await db.insert(dealParticipants).values({
      dealId: deal.id,
      userId: ctx.user!.sub,
      role: 'admin',
    });
    
    return successResponse({ deal }, 201);
  }
);`}
              language="typescript"
              title="Deal Creation API"
            />
            <h2 id="participant-management">Participant Management</h2>
            <p>Deals support multiple participants with different roles:</p>
            <CodeBlock
              code={`// Add participant to deal
POST /api/deals/{dealId}/participants
{
  "userId": "user-uuid",
  "role": "viewer"
}

// Participant roles in deals
type DealParticipantRole = 'admin' | 'editor' | 'viewer';

// Participant permissions
const DEAL_PERMISSIONS = {
  admin: [
    'deal.status_change',
    'deal.send_message',
    'deal.upload_file',
    'deal.read_messages',
    'deal.manage_participants'
  ],
  editor: [
    'deal.send_message',
    'deal.upload_file', 
    'deal.read_messages'
  ],
  viewer: [
    'deal.read_messages'
  ]
};`}
              language="typescript"
              title="Deal Participants"
            />
            <h2 id="deal-metadata">Deal Metadata</h2>
            <p>Deals support flexible metadata for workflow-specific data:</p>
            <CodeBlock
              code={`// Example deal metadata structures
interface BondDealMetadata {
  bondType: 'corporate' | 'government' | 'municipal';
  maturity: string;
  couponRate: number;
  currency: string;
  rating?: string;
  issuer: string;
}

interface RepoDeaMetadata {
  collateralType: string;
  haircut: number;
  term: string;
  rate: number;
  marginCall: boolean;
}

interface CollateralDealMetadata {
  collateralValue: number;
  eligibleAssets: string[];
  marginRequirement: number;
  substitutionAllowed: boolean;
}

// Metadata is stored as JSONB for flexibility
const deal = await db
  .insert(deals)
  .values({
    // ...other fields
    metadata: {
      bondType: 'corporate',
      maturity: '5Y',
      couponRate: 4.5,
      currency: 'USD',
      issuer: 'ACME Corp'
    } as BondDealMetadata
  });`}
              language="typescript"
              title="Deal Metadata Examples"
            />
          </DocContent>
        );

      case 'messaging-sse':
        return (
          <DocContent sectionId="messaging-sse">
            <h1 id="messaging-sse">Real-time Messaging with SSE</h1>
            <p>
              Flowryd uses Server-Sent Events (SSE) for real-time messaging in deals, 
              providing instant communication with automatic reconnection and fallback mechanisms.
            </p>
            <h2 id="sse-architecture">SSE Architecture</h2>
            <CodeBlock
              code={`// SSE connection flow
1. Client establishes SSE connection to /api/deals/{dealId}/messages/stream
2. Server sends 'connected' event to confirm connection
3. Server sends heartbeat every 15 seconds
4. Client receives real-time messages as they're sent
5. Auto-reconnect on connection loss (max 3 attempts)
6. Fallback to polling after failed reconnections

// Connection lifecycle
Connected → Heartbeat (15s) → Message Events → Disconnect/Reconnect`}
              language="text"
              title="SSE Connection Flow"
            />
            <h2 id="sse-implementation">SSE Server Implementation</h2>
            <CodeBlock
              code={`// SSE endpoint implementation
export async function GET(
  req: NextRequest,
  { params }: { params: { dealId: string } }
) {
  const { dealId } = params;
  const user = await getCurrentUser(req);
  
  // Verify user has access to deal
  const hasAccess = await verifyDealAccess(dealId, user.id);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send connection confirmation
      controller.enqueue(\`event: connected\\ndata: {"status":"connected"}\\n\\n\`);
      
      // Set up heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(\`event: heartbeat\\ndata: {"timestamp":"\${new Date().toISOString()}"}\\n\\n\`);
      }, 15000);
      
      // Listen for new messages
      const messageListener = (message: Message) => {
        if (message.dealId === dealId) {
          controller.enqueue(
            \`event: message\\ndata: \${JSON.stringify(message)}\\n\\n\`
          );
        }
      };
      
      // Subscribe to message events
      messageEmitter.on('new_message', messageListener);
      
      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        messageEmitter.off('new_message', messageListener);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}`}
              language="typescript"
              title="SSE Server Implementation"
            />
            <h2 id="client-sse">Client SSE Implementation</h2>
            <CodeBlock
              code={`// Custom SSE hook
export function useSSE(dealId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    if (!dealId) return;
    
    let reconnectTimer: NodeJS.Timeout;
    const maxReconnectAttempts = 3;
    
    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      const eventSource = new EventSource(
        \`/api/deals/\${dealId}/messages/stream\`
      );
      eventSourceRef.current = eventSource;
      
      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
        setReconnectAttempts(0);
      });
      
      eventSource.addEventListener('heartbeat', (event) => {
        // Update last heartbeat timestamp
        console.debug('SSE heartbeat:', event.data);
      });
      
      eventSource.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      });
      
      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
          reconnectTimer = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else {
          console.warn('Max SSE reconnection attempts reached, falling back to polling');
          // Implement polling fallback here
        }
      };
    };
    
    connect();
    
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsConnected(false);
    };
  }, [dealId, reconnectAttempts]);
  
  return { isConnected, lastMessage };
}`}
              language="typescript"
              title="Client SSE Hook"
            />
            <h2 id="message-types">Message Types</h2>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Data Structure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>text</code></td>
                  <td>Regular text message</td>
                  <td>content: string</td>
                </tr>
                <tr>
                  <td><code>file</code></td>
                  <td>File attachment</td>
                  <td>fileUrl, fileName, fileSize</td>
                </tr>
                <tr>
                  <td><code>system</code></td>
                  <td>System notifications</td>
                  <td>content: system message</td>
                </tr>
                <tr>
                  <td><code>status_change</code></td>
                  <td>Deal status updates</td>
                  <td>content: status change info</td>
                </tr>
              </tbody>
            </table>
            <h2 id="polling-fallback">Polling Fallback</h2>
            <p>When SSE fails, the system falls back to polling:</p>
            <CodeBlock
              code={`// Polling fallback implementation
const usePollingFallback = (dealId: string, enabled: boolean) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!enabled || !dealId) return;
    
    const pollMessages = async () => {
      try {
        const url = new URL(\`/api/deals/\${dealId}/messages\`, window.location.origin);
        if (lastMessageId) {
          url.searchParams.set('after', lastMessageId);
        }
        
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          const newMessages = data.data || [];
          
          if (newMessages.length > 0) {
            setMessages(prev => [...newMessages, ...prev]);
            setLastMessageId(newMessages[0].id);
          }
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    };
    
    // Poll every 5 seconds
    const interval = setInterval(pollMessages, 5000);
    pollMessages(); // Initial poll
    
    return () => clearInterval(interval);
  }, [dealId, enabled, lastMessageId]);
  
  return messages;
};`}
              language="typescript"
              title="Polling Fallback"
            />
            <h2 id="connection-monitoring">Connection Monitoring</h2>
            <CodeBlock
              code={`// Connection status component
function ConnectionStatus({ isConnected, reconnectAttempts }: {
  isConnected: boolean;
  reconnectAttempts: number;
}) {
  if (isConnected) {
    return (
      <div className="flex items-center text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
        Connected
      </div>
    );
  }
  
  if (reconnectAttempts > 0) {
    return (
      <div className="flex items-center text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
        Reconnecting... (attempt {reconnectAttempts}/3)
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-red-600">
      <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
      Disconnected
    </div>
  );
}`}
              language="typescript"
              title="Connection Status UI"
            />
          </DocContent>
        );

      case 'file-uploads':
        return (
          <DocContent sectionId="file-uploads">
            <h1 id="file-uploads">File Uploads</h1>
            <p>
              Flowryd supports secure file uploads using Vercel Blob storage, 
              with automatic file type validation and size limits.
            </p>
            <h2 id="upload-configuration">Upload Configuration</h2>
            <table>
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Max File Size</td>
                  <td>10 MB</td>
                  <td>Maximum size per file upload</td>
                </tr>
                <tr>
                  <td>Storage Provider</td>
                  <td>Vercel Blob</td>
                  <td>Scalable file storage with CDN</td>
                </tr>
                <tr>
                  <td>Supported Types</td>
                  <td>PDF, DOC, XLS, IMG</td>
                  <td>Documents and images only</td>
                </tr>
                <tr>
                  <td>Upload Method</td>
                  <td>Multipart Form</td>
                  <td>Standard HTTP multipart upload</td>
                </tr>
              </tbody>
            </table>
            <h2 id="upload-endpoint">File Upload API</h2>
            <CodeBlock
              code={`// Upload file to deal
POST /api/deals/{dealId}/files
Content-Type: multipart/form-data

// Form data:
// - file: File blob
// - threadId: Optional thread ID for message threading

// Implementation
export async function POST(
  req: NextRequest,
  { params }: { params: { dealId: string } }
) {
  const { dealId } = params;
  const user = await getCurrentUser(req);
  
  // Verify permissions
  requirePermission(user.role, 'deal.upload_file');
  
  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const threadId = formData.get('threadId') as string | null;
  
  if (!file) {
    return NextResponse.json(
      { error: { code: 'NO_FILE', message: 'No file provided' } },
      { status: 400 }
    );
  }
  
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: { code: 'FILE_TOO_LARGE', message: 'File exceeds 10MB limit' } },
      { status: 400 }
    );
  }
  
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: { code: 'INVALID_FILE_TYPE', message: 'File type not supported' } },
      { status: 400 }
    );
  }
  
  try {
    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    
    // Create message record
    const [message] = await db
      .insert(messages)
      .values({
        dealId,
        threadId,
        senderId: user.id,
        content: \`Uploaded file: \${file.name}\`,
        contentType: 'file',
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
      })
      .returning();
    
    // Emit SSE event
    messageEmitter.emit('new_message', message);
    
    return successResponse({ message, fileUrl: blob.url });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json(
      { error: { code: 'UPLOAD_FAILED', message: 'File upload failed' } },
      { status: 500 }
    );
  }
}`}
              language="typescript"
              title="File Upload API"
            />
            <h2 id="client-upload">Client Upload Implementation</h2>
            <CodeBlock
              code={`// File upload hook
export function useFileUpload(dealId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const uploadFile = useCallback(async (
    file: File, 
    threadId?: string
  ): Promise<{ success: boolean; message?: Message; error?: string }> => {
    if (!file) return { success: false, error: 'No file selected' };
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (threadId) formData.append('threadId', threadId);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });
      
      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => resolve(new Response(xhr.responseText, { 
          status: xhr.status 
        }));
        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('POST', \`/api/deals/\${dealId}/files\`);
        xhr.send(formData);
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.data.message };
      } else {
        const error = await response.json();
        return { success: false, error: error.error.message };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [dealId]);
  
  return { uploadFile, isUploading, uploadProgress };
}`}
              language="typescript"
              title="File Upload Hook"
            />
            <h2 id="file-preview">File Preview Component</h2>
            <CodeBlock
              code={`// File message component with preview
function FileMessage({ message }: { message: Message }) {
  const [showPreview, setShowPreview] = useState(false);
  
  const isImage = message.fileName?.match(/\\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = message.fileName?.endsWith('.pdf');
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="file-message">
      <div className="file-info">
        <div className="file-icon">
          {isImage ? '🖼️' : isPDF ? '📄' : '📎'}
        </div>
        <div className="file-details">
          <div className="file-name">{message.fileName}</div>
          <div className="file-size">
            {message.fileSize ? formatFileSize(message.fileSize) : 'Unknown size'}
          </div>
        </div>
        <div className="file-actions">
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="download-btn"
          >
            Download
          </a>
          {isImage && (
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="preview-btn"
            >
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          )}
        </div>
      </div>
      
      {showPreview && isImage && (
        <div className="file-preview">
          <img 
            src={message.fileUrl} 
            alt={message.fileName}
            className="max-w-full max-h-96 object-contain"
          />
        </div>
      )}
    </div>
  );
}`}
              language="typescript"
              title="File Preview Component"
            />
            <h2 id="security-considerations">Security Considerations</h2>
            <ul>
              <li><strong>File Type Validation</strong> - Only allow specific MIME types</li>
              <li><strong>Size Limits</strong> - Enforce 10MB maximum file size</li>
              <li><strong>Virus Scanning</strong> - Consider adding virus scanning for production</li>
              <li><strong>Access Control</strong> - Files are only accessible to deal participants</li>
              <li><strong>CDN Distribution</strong> - Vercel Blob provides global CDN access</li>
              <li><strong>Automatic Cleanup</strong> - Consider implementing file retention policies</li>
            </ul>
          </DocContent>
        );

      case 'dashboard':
        return (
          <DocContent sectionId="dashboard">
            <h1 id="dashboard">Admin Dashboard</h1>
            <p>
              The admin panel provides comprehensive system management at the /admin route. 
              AdminOverviewTab serves as the default view with system insights and quick actions.
            </p>
            <h2 id="overview-tab">Overview Tab</h2>
            <p>The AdminOverviewTab displays key system metrics and recent activity:</p>
            <CodeBlock
              code={`// Admin overview component structure
interface AdminOverviewProps {
  stats: {
    totalUsers: number;
    totalDeals: number;
    totalFlows: number;
    systemUptime: string;
  };
  recentActivity: ActivityItem[];
  systemHealth: HealthIndicator[];
}

// Quick stats display
const QuickStats = () => (
  <div className="grid grid-cols-4 gap-4">
    <StatCard title="Users" value={stats.totalUsers} />
    <StatCard title="Deals" value={stats.totalDeals} />
    <StatCard title="Flows" value={stats.totalFlows} />
    <StatCard title="Uptime" value={stats.systemUptime} />
  </div>
);`}
              language="typescript"
              title="AdminOverviewTab.tsx"
            />
            <h2 id="management-tabs">Management Tabs</h2>
            <p>The admin panel includes 12 specialized management tabs:</p>
            <table>
              <thead>
                <tr>
                  <th>Tab</th>
                  <th>Purpose</th>
                  <th>Key Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>overview</code></td>
                  <td>System dashboard</td>
                  <td>Stats, activity feed, health indicators</td>
                </tr>
                <tr>
                  <td><code>users</code></td>
                  <td>User management</td>
                  <td>CRUD operations, role assignment</td>
                </tr>
                <tr>
                  <td><code>audit</code></td>
                  <td>Audit log viewer</td>
                  <td>Activity tracking, security monitoring</td>
                </tr>
                <tr>
                  <td><code>analytics</code></td>
                  <td>System analytics</td>
                  <td>Charts, metrics, performance data</td>
                </tr>
                <tr>
                  <td><code>flows</code></td>
                  <td>Flow management</td>
                  <td>Flow CRUD, status management</td>
                </tr>
                <tr>
                  <td><code>deals</code></td>
                  <td>Deal oversight</td>
                  <td>Deal monitoring, status changes</td>
                </tr>
                <tr>
                  <td><code>templates</code></td>
                  <td>Template management</td>
                  <td>Template CRUD, approval workflow</td>
                </tr>
                <tr>
                  <td><code>join-requests</code></td>
                  <td>Access requests</td>
                  <td>Approve/reject flow access requests</td>
                </tr>
                <tr>
                  <td><code>node-api</code></td>
                  <td>API configuration</td>
                  <td>Canton node endpoints, API keys</td>
                </tr>
                <tr>
                  <td><code>organizations</code></td>
                  <td>Org management</td>
                  <td>Organization CRUD, settings</td>
                </tr>
                <tr>
                  <td><code>subscriptions</code></td>
                  <td>Billing oversight</td>
                  <td>Plan management, payment tracking</td>
                </tr>
                <tr>
                  <td><code>system-settings</code></td>
                  <td>System config</td>
                  <td>Global settings, feature flags</td>
                </tr>
                <tr>
                  <td><code>providers</code></td>
                  <td>Provider network</td>
                  <td>Service provider management</td>
                </tr>
              </tbody>
            </table>
            <h2 id="quick-actions">Quick Actions</h2>
            <p>The overview tab provides quick action buttons for common admin tasks:</p>
            <CodeBlock
              code={`// Quick action buttons
const QuickActions = () => (
  <div className="flex gap-2">
    <Button onClick={() => router.push('/admin/users')}>
      Manage Users
    </Button>
    <Button onClick={() => router.push('/admin/flows')}>
      Review Flows
    </Button>
    <Button onClick={() => router.push('/admin/join-requests')}>
      Pending Requests
    </Button>
    <Button onClick={() => router.push('/admin/system-settings')}>
      System Settings
    </Button>
  </div>
);`}
              language="typescript"
              title="QuickActions.tsx"
            />
            <h2 id="activity-feed">Recent Activity Feed</h2>
            <p>Real-time activity feed shows recent system events:</p>
            <ul>
              <li><strong>User Actions</strong> - Login, logout, role changes</li>
              <li><strong>Flow Events</strong> - Creation, publication, archival</li>
              <li><strong>Deal Activity</strong> - Status changes, participant joins</li>
              <li><strong>System Events</strong> - Configuration changes, errors</li>
              <li><strong>Security Events</strong> - Failed logins, permission changes</li>
            </ul>
          </DocContent>
        );

      case 'analytics':
        return (
          <DocContent sectionId="analytics">
            <h1 id="analytics">Admin Analytics</h1>
            <p>
              AdminAnalyticsTab provides comprehensive system analytics with interactive charts 
              and performance metrics fetched from /api/admin/analytics.
            </p>
            <h2 id="analytics-panels">Analytics Panels</h2>
            <p>The analytics dashboard displays 6 key chart panels:</p>
            <table>
              <thead>
                <tr>
                  <th>Panel</th>
                  <th>Chart Type</th>
                  <th>Data Source</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>User Growth</td>
                  <td>LineChart</td>
                  <td>User registrations over time</td>
                  <td>Track platform adoption</td>
                </tr>
                <tr>
                  <td>Flow Activity</td>
                  <td>BarChart</td>
                  <td>Flow creation/publication stats</td>
                  <td>Monitor workflow usage</td>
                </tr>
                <tr>
                  <td>Deal Volume</td>
                  <td>LineChart</td>
                  <td>Deal creation and completion</td>
                  <td>Track business activity</td>
                </tr>
                <tr>
                  <td>Subscription Breakdown</td>
                  <td>PieChart</td>
                  <td>Plan distribution</td>
                  <td>Revenue analysis</td>
                </tr>
                <tr>
                  <td>Provider Categories</td>
                  <td>PieChart</td>
                  <td>Provider type distribution</td>
                  <td>Network composition</td>
                </tr>
                <tr>
                  <td>System Overview</td>
                  <td>StatCards</td>
                  <td>Real-time metrics</td>
                  <td>System health monitoring</td>
                </tr>
              </tbody>
            </table>
            <h2 id="analytics-api">Analytics API</h2>
            <p>Analytics data is fetched from the admin analytics endpoint:</p>
            <CodeBlock
              code={`// Analytics API response structure
interface AnalyticsData {
  userGrowth: {
    date: string;
    count: number;
  }[];
  flowActivity: {
    month: string;
    created: number;
    published: number;
  }[];
  dealVolume: {
    date: string;
    volume: number;
    completed: number;
  }[];
  subscriptionBreakdown: {
    plan: 'DISCOVER' | 'NAVIGATE' | 'ACTIVATE';
    count: number;
    revenue: number;
  }[];
  providerCategories: {
    category: 'strategy' | 'development' | 'creative';
    count: number;
  }[];
  systemOverview: {
    totalUsers: number;
    activeDeals: number;
    publishedFlows: number;
    monthlyRevenue: number;
    systemUptime: string;
    avgResponseTime: number;
  };
}

// Fetch analytics data
const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const response = await fetch('/api/admin/analytics');
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};`}
              language="typescript"
              title="analytics-api.ts"
            />
            <h2 id="chart-components">Chart Components</h2>
            <p>Analytics uses Recharts library for interactive visualizations:</p>
            <CodeBlock
              code={`// User growth line chart
const UserGrowthChart = ({ data }: { data: UserGrowthData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="count" 
        stroke="#8884d8" 
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
);

// Subscription breakdown pie chart
const SubscriptionChart = ({ data }: { data: SubscriptionData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
      >
        {data.map((entry, index) => (
          <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);`}
              language="typescript"
              title="chart-components.tsx"
            />
            <h2 id="loading-states">Loading & Error States</h2>
            <p>Analytics dashboard includes proper loading and error handling:</p>
            <ul>
              <li><strong>Loading Skeletons</strong> - Shimmer placeholders while data loads</li>
              <li><strong>Error Boundaries</strong> - Graceful error handling with retry buttons</li>
              <li><strong>Retry Mechanism</strong> - Users can retry failed requests</li>
              <li><strong>Refresh Controls</strong> - Manual refresh button for real-time updates</li>
              <li><strong>Data Caching</strong> - SWR for efficient data fetching and caching</li>
            </ul>
            <CodeBlock
              code={`// Analytics loading state
const AnalyticsLoading = () => (
  <div className="grid grid-cols-2 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// Error state with retry
const AnalyticsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">Failed to load analytics data</p>
    <Button onClick={onRetry} variant="outline">
      Retry
    </Button>
  </div>
);`}
              language="typescript"
              title="analytics-states.tsx"
            />
          </DocContent>
        );

      case 'crud-operations':
        return (
          <DocContent sectionId="crud-operations">
            <h1 id="crud-operations">Admin CRUD Operations</h1>
            <p>
              Each admin management tab uses the DataTable component for comprehensive CRUD operations 
              with search, filtering, sorting, and pagination capabilities.
            </p>
            <h2 id="datatable-component">DataTable Component</h2>
            <p>The DataTable component provides a consistent interface for all admin CRUD operations:</p>
            <CodeBlock
              code={`// DataTable component structure
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  onRowAction?: (action: string, row: T) => void;
  loading?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
}

// Column definition with actions
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar src={row.original.avatarUrl} />
        <span>{row.getValue("displayName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={getRoleVariant(row.getValue("role"))}>
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original)}>
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];`}
              language="typescript"
              title="DataTable.tsx"
            />
            <h2 id="admin-tabs">Admin Management Tabs</h2>
            <p>Each admin tab implements CRUD operations using the DataTable:</p>
            <table>
              <thead>
                <tr>
                  <th>Tab Component</th>
                  <th>Entity</th>
                  <th>Key Features</th>
                  <th>Special Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>AdminUsersTab</code></td>
                  <td>Users</td>
                  <td>Role management, status toggle</td>
                  <td>Impersonate, reset password</td>
                </tr>
                <tr>
                  <td><code>AdminFlowsTab</code></td>
                  <td>Flows</td>
                  <td>Status changes, template toggle</td>
                  <td>Publish, archive, duplicate</td>
                </tr>
                <tr>
                  <td><code>AdminDealsTab</code></td>
                  <td>Deals</td>
                  <td>Status monitoring, participant view</td>
                  <td>Force status change, export</td>
                </tr>
                <tr>
                  <td><code>AdminTemplatesTab</code></td>
                  <td>Templates</td>
                  <td>Approval workflow, visibility</td>
                  <td>Approve, feature, hide</td>
                </tr>
                <tr>
                  <td><code>AdminJoinRequestsTab</code></td>
                  <td>Join Requests</td>
                  <td>Approval/rejection, bulk actions</td>
                  <td>Approve all, reject with reason</td>
                </tr>
              </tbody>
            </table>
            <h2 id="search-filter">Search & Filter</h2>
            <p>DataTable includes comprehensive search and filtering capabilities:</p>
            <CodeBlock
              code={`// Search and filter implementation
const DataTableToolbar = ({ table }: { table: Table<any> }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            table.setGlobalFilter(e.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <DataTableFacetedFilter
          column={table.getColumn("role")}
          title="Role"
          options={roleOptions}
        />
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Status"
          options={statusOptions}
        />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
};

// Faceted filter for specific columns
const DataTableFacetedFilter = ({ column, title, options }) => {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <Badge className="ml-2">{selectedValues.size}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value}>
                  <Checkbox
                    checked={selectedValues.has(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectedValues.add(option.value);
                      } else {
                        selectedValues.delete(option.value);
                      }
                      column?.setFilterValue(
                        selectedValues.size ? Array.from(selectedValues) : undefined
                      );
                    }}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};`}
              language="typescript"
              title="DataTableToolbar.tsx"
            />
            <h2 id="modal-dialogs">Create/Edit Modals</h2>
            <p>CRUD operations use modal dialogs for create and edit actions:</p>
            <CodeBlock
              code={`// User create/edit modal
const UserModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    role: user?.role || 'viewer',
    isActive: user?.isActive ?? true,
  });
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to save user');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Create User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Name
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  displayName: e.target.value
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  role: value as UserRole
                }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};`}
              language="typescript"
              title="UserModal.tsx"
            />
            <h2 id="delete-confirmation">Delete Confirmation</h2>
            <p>Delete operations require confirmation dialogs to prevent accidental deletions:</p>
            <ul>
              <li><strong>Confirmation Dialog</strong> - Clear warning about deletion consequences</li>
              <li><strong>Entity Details</strong> - Show what will be deleted (name, ID, etc.)</li>
              <li><strong>Cascade Warnings</strong> - Alert about related data that will be affected</li>
              <li><strong>Soft Delete Option</strong> - Archive instead of permanent deletion where applicable</li>
              <li><strong>Bulk Delete</strong> - Confirm multiple selections with count</li>
            </ul>
          </DocContent>
        );

      case 'database-schema':
        return (
          <DocContent sectionId="database-schema">
            <h1 id="database-schema">Database Schema</h1>
            <p>
              Flowryd uses 19 PostgreSQL tables managed with Drizzle ORM.
              The schema supports multi-tenancy via organizations, append-only versioning for flows,
              and comprehensive audit trails. All timestamps use <code>withTimezone: true</code>.
            </p>

            <h2 id="enums">Enums</h2>
            <CodeBlock
              code={`export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);
export const dealStatusEnum = pgEnum('deal_status', ['draft', 'open', 'negotiating', 'locked', 'committed']);
export const flowStatusEnum = pgEnum('flow_status', ['draft', 'published', 'archived']);
export const auditActionEnum = pgEnum('audit_action', [
  'user.register', 'user.login', 'user.logout', 'user.role_change',
  'flow.create', 'flow.update', 'flow.publish', 'flow.delete', 'flow.version',
  'deal.create', 'deal.status_change', 'deal.participant_add', 'deal.participant_remove',
  'room.create', 'room.join', 'room.leave',
  'message.send', 'file.upload',
  'subscription.create', 'subscription.cancel', 'subscription.renew',
  'provider.apply', 'provider.approve', 'provider.reject'
]);
export const joinRequestStatusEnum = pgEnum('join_request_status', ['pending', 'approved', 'rejected']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['pending', 'trial', 'active', 'past_due', 'cancelled', 'expired']);
export const planTierEnum = pgEnum('plan_tier', ['discover', 'navigate', 'activate']);
export const providerStatusEnum = pgEnum('provider_status', ['pending', 'active', 'inactive']);
export const providerCategoryEnum = pgEnum('provider_category', ['strategy', 'development', 'creative']);`}
              language="typescript"
              title="Enum Definitions"
              copyable={true}
            />

            <h2 id="core-tables">Core Tables</h2>

            <h3 id="organizations">organizations</h3>
            <CodeBlock
              code={`export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="organizations"
              copyable={true}
            />

            <h3 id="users">users</h3>
            <CodeBlock
              code={`export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: varchar('party_id', { length: 195 }).notNull().unique(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),           // nullable, not unique
  role: userRoleEnum('role').notNull().default('viewer'),
  avatarUrl: varchar('avatar_url', { length: 512 }),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="users"
              copyable={true}
            />
            <h3 id="users">Users</h3>
            <CodeBlock
              code={`// users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: varchar('party_id', { length: 195 }).notNull().unique(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: userRoleEnum('role').default('viewer').notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);`}
              language="typescript"
              title="users.ts"
            />
            <h3 id="refresh-tokens-schema">refreshTokens</h3>
            <CodeBlock
              code={`export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  tokenFamily: uuid('token_family').notNull(),         // UUID type, not varchar
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="refreshTokens"
              copyable={true}
            />
            <h2 id="workflow-tables">Workflow Tables</h2>
            <h3 id="flows-schema">flows</h3>
            <CodeBlock
              code={`export const flows = pgTable('flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: flowStatusEnum('status').default('draft'),
  isTemplate: boolean('is_template').default(false),
  isPublic: boolean('is_public').default(false),
  workflowType: varchar('workflow_type', { length: 64 }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isFeatured: boolean('is_featured').default(false),
  featuredHeadline: varchar('featured_headline', { length: 500 }),
  featuredSource: varchar('featured_source', { length: 500 })
});`}
              language="typescript"
              title="flows"
              copyable={true}
            />
            <h3 id="flow-versions-schema">flowVersions</h3>
            <CodeBlock
              code={`export const flowVersions = pgTable('flow_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  version: integer('version').notNull().default(1),
  nodes: jsonb('nodes').notNull().default('[]'),
  edges: jsonb('edges').notNull().default('[]'),
  viewport: jsonb('viewport'),                         // nullable
  metadata: jsonb('metadata'),
  snapshotName: varchar('snapshot_name', { length: 255 }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
// UNIQUE constraint on (flowId, version)`}
              language="typescript"
              title="flowVersions"
              copyable={true}
            />
            <h3 id="flow-participants-schema">flowParticipants</h3>
            <CodeBlock
              code={`export const flowParticipants = pgTable('flow_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  participantId: varchar('participant_id', { length: 64 }).notNull(),
  nodeId: varchar('node_id', { length: 128 }),         // nullable
  positionX: real('position_x'),                       // nullable
  positionY: real('position_y'),                       // nullable
  addedBy: uuid('added_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
// UNIQUE constraint on (flowId, participantId)`}
              language="typescript"
              title="flowParticipants"
              copyable={true}
            />
            <h2 id="deal-tables">Deal Tables</h2>
            <h3 id="deals-schema">deals</h3>
            <CodeBlock
              code={`export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').references(() => flows.id),  // nullable
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: dealStatusEnum('status').default('draft'),
  volume: varchar('volume', { length: 64 }),            // varchar, not decimal
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="deals"
              copyable={true}
            />

            <h3 id="deal-participants-schema">dealParticipants</h3>
            <CodeBlock
              code={`export const dealParticipants = pgTable('deal_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: userRoleEnum('role').default('viewer'),         // uses userRoleEnum, not varchar
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow()
});
// UNIQUE constraint on (dealId, userId)`}
              language="typescript"
              title="dealParticipants"
              copyable={true}
            />

            <h3 id="messages-schema">messages</h3>
            <CodeBlock
              code={`export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id),
  threadId: uuid('thread_id'),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  contentType: varchar('content_type', { length: 32 }).default('text'),
  fileUrl: varchar('file_url', { length: 512 }),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="messages"
              copyable={true}
            />
            <h3 id="deal-participants">Deal Participants</h3>
            <CodeBlock
              code={`// dealParticipants table
export const dealParticipants = pgTable('deal_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').references(() => deals.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: userRoleEnum('role').default('viewer'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});`}
              language="typescript"
              title="deal-participants.ts"
            />
            <h3 id="messages">Messages</h3>
            <CodeBlock
              code={`// messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').references(() => deals.id).notNull(),
  threadId: uuid('thread_id'),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  contentType: contentTypeEnum('content_type').default('text').notNull(),
  fileUrl: varchar('file_url', { length: 500 }),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  isEdited: boolean('is_edited').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentTypeEnum = pgEnum('content_type', ['text', 'file', 'system']);`}
              language="typescript"
              title="messages.ts"
            />
            <h2 id="admin-tables">Admin &amp; System Tables</h2>

            <h3 id="join-requests-schema">joinRequests</h3>
            <CodeBlock
              code={`export const joinRequests = pgTable('join_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  requesterId: uuid('requester_id').notNull().references(() => users.id),
  message: text('message'),
  status: joinRequestStatusEnum('status').default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
// UNIQUE constraint on (flowId, requesterId)`}
              language="typescript"
              title="joinRequests"
              copyable={true}
            />

            <h3 id="audit-log-schema">auditLog</h3>
            <CodeBlock
              code={`export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  orgId: uuid('org_id').references(() => organizations.id),
  action: auditActionEnum('action').notNull(),
  resourceType: varchar('resource_type', { length: 64 }),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="auditLog"
              copyable={true}
            />

            <h3 id="active-sessions-schema">activeSessions</h3>
            <CodeBlock
              code={`export const activeSessions = pgTable('active_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  dealId: uuid('deal_id').references(() => deals.id),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="activeSessions"
              copyable={true}
            />

            <h3 id="node-api-configs-schema">nodeApiConfigs</h3>
            <CodeBlock
              code={`export const nodeApiConfigs = pgTable('node_api_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  endpointUrl: varchar('endpoint_url', { length: 512 }).notNull(),
  apiKeyHash: varchar('api_key_hash', { length: 255 }),
  label: varchar('label', { length: 255 }),
  isActive: boolean('is_active').default(true),
  lastHealthAt: timestamp('last_health_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="nodeApiConfigs"
              copyable={true}
            />
            <h2 id="billing-tables">Billing Tables</h2>

            <h3 id="plans-schema">plans</h3>
            <CodeBlock
              code={`export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  tier: planTierEnum('tier').notNull(),
  priceAmount: integer('price_amount').notNull(),       // in cents
  priceCurrency: varchar('price_currency', { length: 10 }).default('$CC'),
  interval: varchar('interval', { length: 20 }).notNull().default('monthly'),
  features: jsonb('features').default('[]'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="plans"
              copyable={true}
            />

            <h3 id="subscriptions-schema">subscriptions</h3>
            <CodeBlock
              code={`export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  planId: uuid('plan_id').notNull().references(() => plans.id),
  status: subscriptionStatusEnum('status').default('pending'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="subscriptions"
              copyable={true}
            />

            <h3 id="invoices-schema">invoices</h3>
            <CodeBlock
              code={`export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  amountDue: integer('amount_due').notNull(),
  currency: varchar('currency', { length: 10 }).default('$CC'),
  status: varchar('invoice_status', { length: 20 }).default('draft'),
  lineItems: jsonb('line_items').default('[]'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="invoices"
              copyable={true}
            />

            <h3 id="payment-methods-schema">paymentMethods</h3>
            <CodeBlock
              code={`export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  type: varchar('type', { length: 32 }).notNull().default('canton_cc'),
  label: varchar('label', { length: 255 }),
  walletAddress: varchar('wallet_address', { length: 255 }),
  isDefault: boolean('is_default').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="paymentMethods"
              copyable={true}
            />

            <h2 id="provider-tables">Provider Tables</h2>

            <h3 id="providers-schema">providers</h3>
            <CodeBlock
              code={`export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: providerCategoryEnum('category').notNull(),
  description: text('description'),
  website: varchar('website', { length: 512 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 512 }),
  status: providerStatusEnum('status').default('active'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});`}
              language="typescript"
              title="providers"
              copyable={true}
            />

            <h3 id="provider-applications-schema">providerApplications</h3>
            <CodeBlock
              code={`export const providerApplications = pgTable('provider_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  message: text('message'),
  status: joinRequestStatusEnum('status').default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
// UNIQUE constraint on (providerId, userId)`}
              language="typescript"
              title="providerApplications"
              copyable={true}
            />
          </DocContent>
        );

      case 'canton-integration':
        return (
          <DocContent sectionId="canton-integration">
            <h1 id="canton-integration">Canton Network Integration</h1>
            <p>
              Flowryd integrates with Canton Network, an enterprise-grade distributed ledger 
              that provides privacy, scalability, and interoperability for financial workflows.
            </p>
            <h2 id="canton-overview">Canton Network Overview</h2>
            <p>Canton Network provides the foundational infrastructure for Flowryd&apos;s secure deal processing:</p>
            <ul>
              <li><strong>Privacy by Design</strong> - Transactions are only visible to relevant parties</li>
              <li><strong>Enterprise Grade</strong> - Built for institutional financial workflows</li>
              <li><strong>Interoperability</strong> - Seamless integration across different systems</li>
              <li><strong>Scalability</strong> - Handles high-volume transaction processing</li>
              <li><strong>Compliance</strong> - Built-in regulatory compliance features</li>
            </ul>
            <h2 id="party-id-system">Party ID System</h2>
            <p>Each institution in the Canton Network has a unique party identifier:</p>
            <CodeBlock
              code={`// Party ID structure and examples
interface CantonParty {
  partyId: string;        // e.g., "party-goldmansachs-01"
  displayName: string;    // e.g., "Goldman Sachs"
  institution: string;    // e.g., "Goldman Sachs & Co."
  category: 'bank' | 'broker' | 'asset_manager' | 'insurance' | 'other';
  jurisdiction: string;   // e.g., "US", "UK", "EU"
  isActive: boolean;
}

// Example party configurations
const cantonParties: CantonParty[] = [
  {
    partyId: "party-goldmansachs-01",
    displayName: "Goldman Sachs",
    institution: "Goldman Sachs & Co.",
    category: "bank",
    jurisdiction: "US",
    isActive: true
  },
  {
    partyId: "party-jpmorgan-01", 
    displayName: "JPMorgan",
    institution: "JPMorgan Chase & Co.",
    category: "bank",
    jurisdiction: "US",
    isActive: true
  },
  {
    partyId: "party-blackrock-01",
    displayName: "BlackRock",
    institution: "BlackRock Inc.",
    category: "asset_manager", 
    jurisdiction: "US",
    isActive: true
  }
];`}
              language="typescript"
              title="canton-parties.ts"
            />
            <h2 id="canton-coin">Canton Coin ($CC)</h2>
            <p>Canton Coin serves as the native token for payments and subscriptions within the network:</p>
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Description</th>
                  <th>Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Native Token</td>
                  <td>Built into Canton Network protocol</td>
                  <td>Transaction fees, staking</td>
                </tr>
                <tr>
                  <td>Subscription Payments</td>
                  <td>All plan tiers priced in $CC</td>
                  <td>DISCOVER, NAVIGATE, ACTIVATE plans</td>
                </tr>
                <tr>
                  <td>Deal Settlement</td>
                  <td>On-chain settlement of deal terms</td>
                  <td>Automated contract execution</td>
                </tr>
                <tr>
                  <td>Wallet Integration</td>
                  <td>Stored in payment methods table</td>
                  <td>User wallet addresses for $CC</td>
                </tr>
              </tbody>
            </table>
            <h2 id="current-implementation">Current Implementation</h2>
            <p>Flowryd currently uses simulated Canton data while preparing for full integration:</p>
            <CodeBlock
              code={`// src/lib/canton-data.ts - Simulated participant data
export const cantonParticipants = [
  {
    id: "party-goldmansachs-01",
    name: "Goldman Sachs",
    type: "bank" as const,
    jurisdiction: "US",
    isActive: true,
    capabilities: ["trading", "custody", "clearing"],
    contactInfo: {
      email: "integration@gs.com",
      phone: "+1-212-902-1000"
    }
  },
  {
    id: "party-jpmorgan-01", 
    name: "JPMorgan",
    type: "bank" as const,
    jurisdiction: "US", 
    isActive: true,
    capabilities: ["trading", "custody", "prime_brokerage"],
    contactInfo: {
      email: "canton@jpmorgan.com",
      phone: "+1-212-270-6000"
    }
  },
  // ... more participants
];

// Participant filtering and search
export const getActiveParticipants = () => 
  cantonParticipants.filter(p => p.isActive);

export const getParticipantsByType = (type: string) =>
  cantonParticipants.filter(p => p.type === type);

export const searchParticipants = (query: string) =>
  cantonParticipants.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase())
  );`}
              language="typescript"
              title="canton-data.ts"
            />
            <h2 id="integration-roadmap">Integration Roadmap</h2>
            <p>Full Canton Network integration is planned for future milestones:</p>
            <h3 id="milestone-3">Milestone 3 (M3) - Smart Contracts</h3>
            <ul>
              <li><strong>Daml Smart Contracts</strong> - Deploy deal workflow contracts</li>
              <li><strong>Automated Settlement</strong> - On-chain deal execution</li>
              <li><strong>Compliance Automation</strong> - Built-in regulatory checks</li>
              <li><strong>Multi-party Workflows</strong> - Complex deal orchestration</li>
            </ul>
            <h3 id="identity-verification">Identity Verification</h3>
            <CodeBlock
              code={`// Future: Real Canton identity verification
interface CantonIdentity {
  partyId: string;
  certificate: string;      // X.509 certificate
  publicKey: string;        // Cryptographic public key
  verificationStatus: 'pending' | 'verified' | 'revoked';
  issuedBy: string;         // Certificate authority
  expiresAt: Date;
  permissions: string[];    // Network permissions
}

// Identity verification workflow
const verifyCantonIdentity = async (partyId: string): Promise<CantonIdentity> => {
  // Connect to Canton Network identity service
  const identity = await cantonNetwork.verifyParty(partyId);
  
  // Validate certificate chain
  const isValid = await validateCertificateChain(identity.certificate);
  
  if (!isValid) {
    throw new Error('Invalid Canton identity certificate');
  }
  
  return identity;
};`}
              language="typescript"
              title="canton-identity.ts"
            />
            <h3 id="on-chain-settlement">On-Chain Deal Settlement</h3>
            <CodeBlock
              code={`// Future: On-chain deal settlement
interface DealContract {
  dealId: string;
  participants: string[];   // Party IDs
  terms: {
    volume: number;
    currency: string;
    settlementDate: Date;
    conditions: string[];
  };
  status: 'draft' | 'signed' | 'executed' | 'settled';
  signatures: {
    partyId: string;
    signature: string;
    timestamp: Date;
  }[];
}

// Deploy deal contract to Canton
const deployDealContract = async (deal: Deal): Promise<string> => {
  const contract: DealContract = {
    dealId: deal.id,
    participants: deal.participants.map(p => p.partyId),
    terms: {
      volume: deal.volume,
      currency: '$CC',
      settlementDate: deal.settlementDate,
      conditions: deal.conditions
    },
    status: 'draft',
    signatures: []
  };
  
  // Submit to Canton Network
  const contractId = await cantonNetwork.deployContract(contract);
  
  // Update deal with contract reference
  await updateDeal(deal.id, { contractId });
  
  return contractId;
};`}
              language="typescript"
              title="deal-settlement.ts"
            />
            <h2 id="payment-integration">Payment Integration</h2>
            <p>Canton Coin wallet integration for subscription payments:</p>
            <CodeBlock
              code={`// Payment method with Canton Coin wallet
interface CantonPaymentMethod {
  id: string;
  orgId: string;
  type: 'canton_cc';
  walletAddress: string;    // Canton Coin wallet address
  balance?: number;         // Available $CC balance
  isDefault: boolean;
  metadata: {
    walletProvider: string; // e.g., "Canton Wallet", "MetaMask"
    networkId: string;      // Canton Network identifier
    lastSyncAt: Date;
  };
}

// Process subscription payment with $CC
const processCantonPayment = async (
  subscriptionId: string, 
  amount: number
): Promise<PaymentResult> => {
  const subscription = await getSubscription(subscriptionId);
  const paymentMethod = await getDefaultPaymentMethod(subscription.orgId);
  
  if (paymentMethod.type !== 'canton_cc') {
    throw new Error('Canton Coin payment method required');
  }
  
  // Check wallet balance
  const balance = await cantonNetwork.getWalletBalance(paymentMethod.walletAddress);
  if (balance < amount) {
    throw new Error('Insufficient $CC balance');
  }
  
  // Execute payment transaction
  const transaction = await cantonNetwork.transfer({
    from: paymentMethod.walletAddress,
    to: FLOWRYD_TREASURY_ADDRESS,
    amount,
    currency: '$CC',
    reference: subscriptionId
  });
  
  return {
    transactionId: transaction.id,
    status: 'completed',
    amount,
    currency: '$CC'
  };
};`}
              language="typescript"
              title="canton-payments.ts"
            />
          </DocContent>
        );

      case 'subscriptions-billing':
        return (
          <DocContent sectionId="subscriptions-billing">
            <h1 id="subscriptions-billing">Subscriptions & Billing</h1>
            <p>
              Flowryd offers three subscription tiers with Canton Coin ($CC) payments, 
              comprehensive billing management, and retainer upsell options.
            </p>
            <h2 id="plan-tiers">Plan Tiers</h2>
            <p>Three subscription tiers designed for different organizational needs:</p>
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Target Audience</th>
                  <th>Key Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>DISCOVER</strong></td>
                  <td>$100/month</td>
                  <td>Small teams, startups</td>
                  <td>Basic flows, 5 users, community support</td>
                </tr>
                <tr>
                  <td><strong>NAVIGATE</strong></td>
                  <td>$250/month</td>
                  <td>Growing companies</td>
                  <td>Advanced flows, 25 users, priority support</td>
                </tr>
                <tr>
                  <td><strong>ACTIVATE</strong></td>
                  <td>$500/month</td>
                  <td>Enterprise organizations</td>
                  <td>Unlimited flows/users, dedicated support</td>
                </tr>
              </tbody>
            </table>
            <h2 id="plan-structure">Plan Structure</h2>
            <p>Plans are stored with pricing in cents and Canton Coin currency:</p>
            <CodeBlock
              code={`// Plan configuration
interface Plan {
  id: string;
  name: string;
  tier: 'discover' | 'navigate' | 'activate';
  priceAmount: number;      // Price in cents (e.g., 10000 = $100)
  priceCurrency: string;    // Defaults to '$CC' (Canton Coin)
  interval: 'monthly' | 'yearly';
  features: {
    maxUsers: number | null;        // null = unlimited
    maxFlows: number | null;        // null = unlimited
    maxDeals: number | null;        // null = unlimited
    supportLevel: 'community' | 'priority' | 'dedicated';
    customBranding: boolean;
    apiAccess: boolean;
    advancedAnalytics: boolean;
    ssoIntegration: boolean;
  };
  isActive: boolean;
}

// Example plan configurations
const plans: Plan[] = [
  {
    id: 'plan-discover',
    name: 'DISCOVER',
    tier: 'discover',
    priceAmount: 10000,     // $100 in cents
    priceCurrency: '$CC',
    interval: 'monthly',
    features: {
      maxUsers: 5,
      maxFlows: 10,
      maxDeals: 25,
      supportLevel: 'community',
      customBranding: false,
      apiAccess: false,
      advancedAnalytics: false,
      ssoIntegration: false
    },
    isActive: true
  },
  {
    id: 'plan-navigate',
    name: 'NAVIGATE', 
    tier: 'navigate',
    priceAmount: 25000,     // $250 in cents
    priceCurrency: '$CC',
    interval: 'monthly',
    features: {
      maxUsers: 25,
      maxFlows: 50,
      maxDeals: 100,
      supportLevel: 'priority',
      customBranding: true,
      apiAccess: true,
      advancedAnalytics: false,
      ssoIntegration: true
    },
    isActive: true
  },
  {
    id: 'plan-activate',
    name: 'ACTIVATE',
    tier: 'activate', 
    priceAmount: 50000,     // $500 in cents
    priceCurrency: '$CC',
    interval: 'monthly',
    features: {
      maxUsers: null,       // Unlimited
      maxFlows: null,       // Unlimited
      maxDeals: null,       // Unlimited
      supportLevel: 'dedicated',
      customBranding: true,
      apiAccess: true,
      advancedAnalytics: true,
      ssoIntegration: true
    },
    isActive: true
  }
];`}
              language="typescript"
              title="plans.ts"
            />
            <h2 id="subscription-lifecycle">Subscription Lifecycle</h2>
            <p>Subscriptions progress through distinct states with automated transitions:</p>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Next States</th>
                  <th>Actions Available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>pending</code></td>
                  <td>Subscription created, awaiting payment</td>
                  <td>trial, active, cancelled</td>
                  <td>Complete setup, cancel</td>
                </tr>
                <tr>
                  <td><code>trial</code></td>
                  <td>Free trial period (14 days)</td>
                  <td>active, expired</td>
                  <td>Upgrade, extend trial</td>
                </tr>
                <tr>
                  <td><code>active</code></td>
                  <td>Subscription is current and paid</td>
                  <td>past_due, cancelled</td>
                  <td>Change plan, cancel</td>
                </tr>
                <tr>
                  <td><code>past_due</code></td>
                  <td>Payment failed, grace period active</td>
                  <td>active, cancelled, expired</td>
                  <td>Retry payment, update method</td>
                </tr>
                <tr>
                  <td><code>cancelled</code></td>
                  <td>Cancelled but still active until period end</td>
                  <td>expired</td>
                  <td>Reactivate</td>
                </tr>
                <tr>
                  <td><code>expired</code></td>
                  <td>Subscription ended, access revoked</td>
                  <td>active</td>
                  <td>Renew subscription</td>
                </tr>
              </tbody>
            </table>
            <h2 id="billing-system">Billing System</h2>
            <p>Comprehensive billing with invoices, line items, and payment tracking:</p>
            <CodeBlock
              code={`// Invoice structure
interface Invoice {
  id: string;
  orgId: string;
  subscriptionId: string;
  amountDue: number;        // Amount in cents
  currency: string;         // '$CC' for Canton Coin
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;      // In cents
    totalPrice: number;     // In cents
    period?: {
      start: Date;
      end: Date;
    };
  }[];
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;   // Payment method ID
  metadata?: Record<string, any>;
}

// Generate monthly invoice
const generateInvoice = async (subscriptionId: string): Promise<Invoice> => {
  const subscription = await getSubscription(subscriptionId);
  const plan = await getPlan(subscription.planId);
  
  const invoice: Invoice = {
    id: generateId(),
    orgId: subscription.orgId,
    subscriptionId,
    amountDue: plan.priceAmount,
    currency: plan.priceCurrency,
    status: 'pending',
    lineItems: [
      {
        description: \`\${plan.name} Plan - Monthly Subscription\`,
        quantity: 1,
        unitPrice: plan.priceAmount,
        totalPrice: plan.priceAmount,
        period: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd
        }
      }
    ],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    metadata: {
      planTier: plan.tier,
      billingCycle: plan.interval
    }
  };
  
  return await createInvoice(invoice);
};`}
              language="typescript"
              title="billing.ts"
            />
            <h2 id="canton-coin-payments">Canton Coin Payments</h2>
            <p>All payments processed using Canton Coin ($CC) through wallet integration:</p>
            <CodeBlock
              code={`// Payment processing with Canton Coin
interface PaymentMethod {
  id: string;
  orgId: string;
  type: 'canton_cc';
  walletAddress: string;    // Canton Coin wallet address
  isDefault: boolean;
  metadata: {
    walletProvider: string;
    balance?: number;       // Cached balance in $CC
    lastSyncAt: Date;
  };
}

// Process subscription payment
const processSubscriptionPayment = async (
  invoiceId: string
): Promise<PaymentResult> => {
  const invoice = await getInvoice(invoiceId);
  const paymentMethod = await getDefaultPaymentMethod(invoice.orgId);
  
  if (paymentMethod.type !== 'canton_cc') {
    throw new Error('Canton Coin payment required');
  }
  
  // Convert cents to $CC (assuming 1:1 ratio for now)
  const amountCC = invoice.amountDue / 100;
  
  try {
    // Execute Canton Coin transfer
    const transaction = await cantonNetwork.transfer({
      from: paymentMethod.walletAddress,
      to: FLOWRYD_TREASURY_WALLET,
      amount: amountCC,
      currency: '$CC',
      reference: invoiceId,
      metadata: {
        subscriptionId: invoice.subscriptionId,
        orgId: invoice.orgId
      }
    });
    
    // Update invoice status
    await updateInvoice(invoiceId, {
      status: 'paid',
      paidAt: new Date(),
      paymentMethod: paymentMethod.id,
      metadata: {
        ...invoice.metadata,
        transactionId: transaction.id,
        transactionHash: transaction.hash
      }
    });
    
    // Update subscription status
    await updateSubscriptionStatus(invoice.subscriptionId, 'active');
    
    return {
      success: true,
      transactionId: transaction.id,
      amount: amountCC,
      currency: '$CC'
    };
    
  } catch (error) {
    // Handle payment failure
    await updateInvoice(invoiceId, { status: 'overdue' });
    await updateSubscriptionStatus(invoice.subscriptionId, 'past_due');
    
    throw new Error(\`Payment failed: \${error.message}\`);
  }
};`}
              language="typescript"
              title="canton-payments.ts"
            />
            <h2 id="retainer-upsell">Retainer Upsell</h2>
            <p>Premium retainer services offered as upsell to existing subscribers:</p>
            <ul>
              <li><strong>Dedicated Account Manager</strong> - Personal point of contact</li>
              <li><strong>Custom Workflow Design</strong> - Bespoke flow creation services</li>
              <li><strong>Priority Implementation</strong> - Fast-track feature requests</li>
              <li><strong>Training & Onboarding</strong> - Comprehensive team training</li>
              <li><strong>24/7 Support</strong> - Round-the-clock technical assistance</li>
              <li><strong>Compliance Consulting</strong> - Regulatory guidance and setup</li>
            </ul>
            <CodeBlock
              code={`// Retainer service configuration
interface RetainerService {
  id: string;
  name: string;
  description: string;
  monthlyRate: number;      // In $CC
  minimumCommitment: number; // Months
  features: string[];
  eligiblePlans: ('discover' | 'navigate' | 'activate')[];
}

const retainerServices: RetainerService[] = [
  {
    id: 'retainer-premium',
    name: 'Premium Support Retainer',
    description: 'Dedicated account management and priority support',
    monthlyRate: 2000,      // $2000 in $CC
    minimumCommitment: 6,   // 6 months minimum
    features: [
      'Dedicated account manager',
      '24/7 priority support',
      'Monthly strategy calls',
      'Custom workflow consulting'
    ],
    eligiblePlans: ['navigate', 'activate']
  },
  {
    id: 'retainer-enterprise',
    name: 'Enterprise Implementation Retainer', 
    description: 'Full-service implementation and ongoing optimization',
    monthlyRate: 5000,      // $5000 in $CC
    minimumCommitment: 12,  // 12 months minimum
    features: [
      'All Premium Support features',
      'Custom development hours',
      'Compliance consulting',
      'Training and onboarding',
      'Integration assistance'
    ],
    eligiblePlans: ['activate']
  }
];`}
              language="typescript"
              title="retainer-services.ts"
            />
            <h2 id="billing-admin">Billing Administration</h2>
            <p>Admin tools for subscription and billing management:</p>
            <ul>
              <li><strong>Subscription Overview</strong> - Real-time status across all organizations</li>
              <li><strong>Payment Tracking</strong> - Monitor successful and failed payments</li>
              <li><strong>Revenue Analytics</strong> - Monthly recurring revenue (MRR) tracking</li>
              <li><strong>Dunning Management</strong> - Automated retry logic for failed payments</li>
              <li><strong>Plan Changes</strong> - Prorated upgrades and downgrades</li>
              <li><strong>Refund Processing</strong> - Handle refund requests and adjustments</li>
            </ul>
          </DocContent>
        );

      case 'deployment':
        return (
          <DocContent sectionId="deployment">
            <h1 id="deployment">Deployment</h1>
            <p>
              Flowryd is built with Next.js 15 and deployed on Vercel with Neon PostgreSQL 
              and Vercel Blob for file storage. This section covers deployment configuration and requirements.
            </p>
            <h2 id="tech-stack">Technology Stack</h2>
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Technology</th>
                  <th>Purpose</th>
                  <th>Provider</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frontend/Backend</td>
                  <td>Next.js 15</td>
                  <td>Full-stack React framework</td>
                  <td>Vercel</td>
                </tr>
                <tr>
                  <td>Database</td>
                  <td>PostgreSQL</td>
                  <td>Primary data storage</td>
                  <td>Neon</td>
                </tr>
                <tr>
                  <td>ORM</td>
                  <td>Drizzle</td>
                  <td>Type-safe database queries</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>File Storage</td>
                  <td>Vercel Blob</td>
                  <td>File uploads and attachments</td>
                  <td>Vercel</td>
                </tr>
                <tr>
                  <td>Hosting</td>
                  <td>Vercel Platform</td>
                  <td>Serverless deployment</td>
                  <td>Vercel</td>
                </tr>
              </tbody>
            </table>
            <h2 id="environment-variables">Environment Variables</h2>
            <p>Required environment variables for deployment:</p>
            <CodeBlock
              code={`# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Application URLs
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"

# Vercel Blob Storage (automatically provided by Vercel)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token"

# Optional: Canton Network Integration (future)
CANTON_NETWORK_URL="https://canton-network-api.com"
CANTON_API_KEY="your-canton-api-key"

# Optional: Email Service (future)
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# Optional: Analytics (future)
ANALYTICS_API_KEY="your-analytics-key"`}
              language="bash"
              title=".env.local"
            />
            <h2 id="database-setup">Database Setup</h2>
            <p>Setting up the PostgreSQL database with Drizzle migrations:</p>
            <CodeBlock
              code={`# Install dependencies
npm install

# Generate Drizzle configuration
npx drizzle-kit generate:pg

# Push schema to database (creates tables)
npx drizzle-kit push:pg

# Optional: Seed database with initial data
npm run db:seed

# Verify database connection
npm run db:studio`}
              language="bash"
              title="Database Setup Commands"
            />
            <h3 id="drizzle-config">Drizzle Configuration</h3>
            <CodeBlock
              code={`// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;`}
              language="typescript"
              title="drizzle.config.ts"
            />
            <h2 id="build-process">Build Process</h2>
            <p>Next.js build and deployment commands:</p>
            <CodeBlock
              code={`# Development server
npm run dev

# Production build
npm run build

# Start production server (for self-hosting)
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npm run db:generate    # Generate migrations
npm run db:push        # Push schema changes
npm run db:studio      # Open Drizzle Studio
npm run db:seed        # Seed database`}
              language="bash"
              title="Build Commands"
            />
            <h2 id="vercel-deployment">Vercel Deployment</h2>
            <p>Deploying to Vercel platform with automatic CI/CD:</p>
            <CodeBlock
              code={`// vercel.json - Deployment configuration
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "NEXT_PUBLIC_APP_URL": "@app-url"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url"
    }
  }
}`}
              language="json"
              title="vercel.json"
            />
            <h3 id="deployment-steps">Deployment Steps</h3>
            <ol>
              <li><strong>Connect Repository</strong> - Link GitHub repo to Vercel</li>
              <li><strong>Configure Environment</strong> - Add required environment variables</li>
              <li><strong>Database Setup</strong> - Create Neon database and run migrations</li>
              <li><strong>Deploy</strong> - Automatic deployment on git push</li>
              <li><strong>Custom Domain</strong> - Configure custom domain if needed</li>
            </ol>
            <h2 id="neon-database">Neon Database Configuration</h2>
            <p>Setting up Neon PostgreSQL for production:</p>
            <CodeBlock
              code={`// Database connection with Neon
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Neon connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Connection pooling for high traffic
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000, // Connection timeout
});

// Health check endpoint
export async function GET() {
  try {
    const result = await sql\`SELECT 1 as health\`;
    return Response.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy', 
      error: error.message 
    }, { status: 500 });
  }
}`}
              language="typescript"
              title="database-connection.ts"
            />
            <h2 id="file-storage">File Storage Setup</h2>
            <p>Vercel Blob configuration for file uploads:</p>
            <CodeBlock
              code={`// File upload with Vercel Blob
import { put } from '@vercel/blob';

export async function uploadFile(
  file: File, 
  dealId: string
): Promise<string> {
  const filename = \`deals/\${dealId}/\${Date.now()}-\${file.name}\`;
  
  const blob = await put(filename, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    multipart: true,
  });
  
  return blob.url;
}

// File cleanup (optional)
import { del } from '@vercel/blob';

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}`}
              language="typescript"
              title="file-storage.ts"
            />
            <h2 id="monitoring">Monitoring & Health Checks</h2>
            <p>Production monitoring and health check endpoints:</p>
            <CodeBlock
              code={`// Health check API route
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    auth: await checkAuth(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  
  const isHealthy = Object.values(checks).every(
    check => typeof check === 'object' ? check.status === 'ok' : true
  );
  
  return Response.json(checks, { 
    status: isHealthy ? 200 : 503 
  });
}

async function checkDatabase() {
  try {
    await db.select().from(organizations).limit(1);
    return { status: 'ok', latency: Date.now() };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkStorage() {
  try {
    // Test blob storage access
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkAuth() {
  try {
    // Test JWT functionality
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}`}
              language="typescript"
              title="health-check.ts"
            />
            <h2 id="performance">Performance Optimization</h2>
            <p>Production performance optimizations:</p>
            <ul>
              <li><strong>Static Generation</strong> - Pre-render pages where possible</li>
              <li><strong>Image Optimization</strong> - Next.js automatic image optimization</li>
              <li><strong>Code Splitting</strong> - Automatic bundle splitting</li>
              <li><strong>CDN Distribution</strong> - Vercel Edge Network</li>
              <li><strong>Database Indexing</strong> - Optimized database queries</li>
              <li><strong>Caching Strategy</strong> - Redis for session and data caching</li>
            </ul>
            <h2 id="security">Security Configuration</h2>
            <p>Production security settings:</p>
            <ul>
              <li><strong>HTTPS Only</strong> - Force HTTPS in production</li>
              <li><strong>CORS Configuration</strong> - Restrict cross-origin requests</li>
              <li><strong>Rate Limiting</strong> - API rate limiting and DDoS protection</li>
              <li><strong>Environment Isolation</strong> - Separate staging and production</li>
              <li><strong>Secret Management</strong> - Secure environment variable handling</li>
              <li><strong>Database Security</strong> - Connection encryption and access controls</li>
            </ul>
          </DocContent>
        );

      case 'api-authentication':
        return (
          <DocContent sectionId="api-authentication">
            <h1 id="api-authentication">Authentication API</h1>
            <p>
              Authentication endpoints handle user login, registration, token refresh, and session management.
              All authentication uses httpOnly cookies for security.
            </p>
            <h2 id="login">POST /api/auth/login</h2>
            <p>Authenticate user with Party ID and password. Sets httpOnly JWT cookies.</p>
            <CodeBlock code={`// Request
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    partyId: 'party123::participant456',
    password: 'securePassword123'
  })
});

// Response
{
  "data": {
    "user": {
      "id": "uuid-123",
      "partyId": "party123::participant456",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "orgId": "org-uuid-456"
    }
  }
}

// Sets httpOnly cookies:
// - flowryd_token (JWT access token, 15min)
// - flowryd_refresh (refresh token, 7 days)`} language="typescript" title="login.ts" />
            <h2 id="register">POST /api/auth/register</h2>
            <p>Register new user and create organization. Returns same response as login.</p>
            <CodeBlock code={`// Request
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    partyId: 'newparty::participant789',
    password: 'securePassword123',
    displayName: 'Jane Smith',
    email: 'jane@example.com' // optional
  })
});

// Response
{
  "data": {
    "user": {
      "id": "uuid-789",
      "partyId": "newparty::participant789",
      "displayName": "Jane Smith",
      "email": "jane@example.com",
      "role": "admin", // First user becomes admin
      "orgId": "new-org-uuid"
    }
  }
}`} language="typescript" title="register.ts" />
            <h2 id="refresh">POST /api/auth/refresh</h2>
            <p>Refresh access token using httpOnly refresh token cookie. Implements token rotation.</p>
            <CodeBlock code={`// Request (uses httpOnly cookie automatically)
fetch('/api/auth/refresh', {
  method: 'POST'
});

// Response
{
  "data": {
    "success": true
  }
}

// Updates httpOnly cookies with new tokens`} language="typescript" title="refresh.ts" />
            <h2 id="logout">POST /api/auth/logout</h2>
            <p>Clear authentication cookies and revoke refresh token family.</p>
            <CodeBlock code={`// Request
fetch('/api/auth/logout', {
  method: 'POST'
});

// Response
{
  "data": {
    "success": true
  }
}

// Clears all auth cookies and revokes tokens`} language="typescript" title="logout.ts" />
            <h2 id="me">GET /api/auth/me</h2>
            <p>Get current authenticated user information from JWT cookie.</p>
            <CodeBlock code={`// Request
fetch('/api/auth/me');

// Response
{
  "data": {
    "user": {
      "id": "uuid-123",
      "partyId": "party123::participant456",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "orgId": "org-uuid-456"
    }
  }
}`} language="typescript" title="me.ts" />
          </DocContent>
        );

      case 'api-flows':
        return (
          <DocContent sectionId="api-flows">
            <h1 id="api-flows">Flows API</h1>
            <p>
              Flow endpoints manage workflow creation, versioning, publishing, and template operations.
              All endpoints require authentication and respect RBAC permissions.
            </p>
            <h2 id="list-flows">GET /api/flows</h2>
            <p>List all flows for the user&apos;s organization. Use ?template=true for templates only.</p>
            <CodeBlock code={`// Request
fetch('/api/flows?template=true');

// Response
{
  "data": [
    {
      "id": "flow-uuid-123",
      "title": "Token Issuance Flow",
      "description": "Automated digital bond issuance",
      "status": "published",
      "workflowType": "token-issuance",
      "isTemplate": true,
      "isPublic": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ]
}`} language="typescript" title="list-flows.ts" />
            <h2 id="create-flow">POST /api/flows</h2>
            <p>Create new flow. Requires flow.create permission.</p>
            <CodeBlock code={`// Request
fetch('/api/flows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My New Flow',
    description: 'Custom workflow for repo trading',
    workflowType: 'repo-financing'
  })
});

// Response
{
  "data": {
    "flow": {
      "id": "new-flow-uuid",
      "title": "My New Flow",
      "description": "Custom workflow for repo trading",
      "status": "draft",
      "workflowType": "repo-financing",
      "orgId": "org-uuid-456",
      "createdBy": "user-uuid-123",
      "createdAt": "2024-01-25T09:15:00Z"
    }
  }
}`} language="typescript" title="create-flow.ts" />
            <h2 id="get-flow">GET /api/flows/[flowId]</h2>
            <p>Get specific flow with its latest version.</p>
            <CodeBlock code={`// Request
fetch('/api/flows/flow-uuid-123');

// Response
{
  "data": {
    "flow": {
      "id": "flow-uuid-123",
      "title": "Token Issuance Flow",
      "status": "published",
      "workflowType": "token-issuance"
    },
    "version": {
      "id": "version-uuid-789",
      "version": 3,
      "nodes": [...], // ReactFlow nodes
      "edges": [...], // ReactFlow edges
      "viewport": { "x": 0, "y": 0, "zoom": 1 },
      "createdAt": "2024-01-20T14:45:00Z"
    }
  }
}`} language="typescript" title="get-flow.ts" />
            <h2 id="update-flow">PATCH /api/flows/[flowId]</h2>
            <p>Update flow metadata. Requires flow.edit permission.</p>
            <CodeBlock code={`// Request
fetch('/api/flows/flow-uuid-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Flow Title',
    description: 'New description',
    status: 'published',
    workflowType: 'custom'
  })
});

// Response
{
  "data": {
    "flow": {
      "id": "flow-uuid-123",
      "title": "Updated Flow Title",
      "description": "New description",
      "status": "published",
      "updatedAt": "2024-01-25T16:30:00Z"
    }
  }
}`} language="typescript" title="update-flow.ts" />
            <h2 id="publish-flow">POST /api/flows/[flowId]/publish</h2>
            <p>Publish flow to make it available for deals. Requires flow.publish permission.</p>
            <CodeBlock code={`// Request
fetch('/api/flows/flow-uuid-123/publish', {
  method: 'POST'
});

// Response
{
  "data": {
    "flow": {
      "id": "flow-uuid-123",
      "status": "published",
      "updatedAt": "2024-01-25T16:45:00Z"
    }
  }
}`} language="typescript" title="publish-flow.ts" />
            <h2 id="flow-versions">GET /api/flows/[flowId]/versions</h2>
            <p>Get all versions of a flow.</p>
            <CodeBlock code={`// Request
fetch('/api/flows/flow-uuid-123/versions');

// Response
{
  "data": [
    {
      "id": "version-uuid-789",
      "version": 3,
      "snapshotName": "Production Release",
      "createdBy": "user-uuid-123",
      "createdAt": "2024-01-20T14:45:00Z"
    },
    {
      "id": "version-uuid-456",
      "version": 2,
      "snapshotName": "Beta Version",
      "createdAt": "2024-01-18T11:20:00Z"
    }
  ]
}`} language="typescript" title="flow-versions.ts" />
            <h2 id="create-version">POST /api/flows/[flowId]/versions</h2>
            <p>Create new flow version. Requires flow.edit permission.</p>
            <CodeBlock code={`// Request
fetch('/api/flows/flow-uuid-123/versions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nodes: [
      { id: '1', type: 'institutional', position: { x: 100, y: 100 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' }
    ],
    viewport: { x: 0, y: 0, zoom: 1 }
  })
});

// Response
{
  "data": {
    "version": {
      "id": "new-version-uuid",
      "version": 4,
      "flowId": "flow-uuid-123",
      "createdAt": "2024-01-25T17:00:00Z"
    }
  }
}`} language="typescript" title="create-version.ts" />
            <h2 id="join-flow">POST /api/flows/[flowId]/join</h2>
            <p>Request to join a flow as a participant.</p>
            <CodeBlock code={`// Request
fetch('/api/flows/flow-uuid-123/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Would like to participate as collateral agent'
  })
});

// Response
{
  "data": {
    "joinRequest": {
      "id": "request-uuid-789",
      "flowId": "flow-uuid-123",
      "userId": "user-uuid-123",
      "status": "pending",
      "message": "Would like to participate as collateral agent",
      "createdAt": "2024-01-25T17:15:00Z"
    }
  }
}`} language="typescript" title="join-flow.ts" />
          </DocContent>
        );

      case 'api-deals':
        return (
          <DocContent sectionId="api-deals">
            <h1 id="api-deals">Deals API</h1>
            <p>
              Deal endpoints manage deal lifecycle, messaging, file uploads, and participant management.
              Deals represent active instances of published flows.
            </p>
            <h2 id="list-deals">GET /api/deals</h2>
            <p>List all deals accessible to the user.</p>
            <CodeBlock code={`// Request
fetch('/api/deals');

// Response
{
  "data": [
    {
      "id": "deal-uuid-123",
      "title": "ACME Corp Bond Issuance",
      "description": "Issue $100M corporate bonds",
      "status": "negotiating",
      "volume": "100000000",
      "flowId": "flow-uuid-456",
      "createdAt": "2024-01-20T09:00:00Z",
      "updatedAt": "2024-01-22T14:30:00Z"
    }
  ]
}`} language="typescript" title="list-deals.ts" />
            <h2 id="create-deal">POST /api/deals</h2>
            <p>Create new deal. Requires deal.create permission (admin only).</p>
            <CodeBlock code={`// Request
fetch('/api/deals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Repo Deal',
    description: 'Overnight repo transaction',
    volume: "50000000",
    flowId: 'flow-uuid-789'
  })
});

// Response
{
  "data": {
    "deal": {
      "id": "new-deal-uuid",
      "title": "New Repo Deal",
      "description": "Overnight repo transaction",
      "status": "draft",
      "volume": "50000000",
      "flowId": "flow-uuid-789",
      "createdBy": "admin-uuid-123",
      "createdAt": "2024-01-25T10:00:00Z"
    }
  }
}`} language="typescript" title="create-deal.ts" />
            <h2 id="get-deal">GET /api/deals/[dealId]</h2>
            <p>Get specific deal with participants.</p>
            <CodeBlock code={`// Request
fetch('/api/deals/deal-uuid-123');

// Response
{
  "data": {
    "deal": {
      "id": "deal-uuid-123",
      "title": "ACME Corp Bond Issuance",
      "status": "negotiating",
      "volume": "100000000",
      "flowId": "flow-uuid-456"
    },
    "participants": [
      {
        "id": "participant-uuid-1",
        "userId": "user-uuid-456",
        "role": "admin",
        "joinedAt": "2024-01-20T09:15:00Z",
        "displayName": "John Trader",
        "partyId": "mybank::trader001"
      },
      {
        "id": "participant-uuid-2",
        "userId": "user-uuid-789",
        "role": "editor",
        "joinedAt": "2024-01-20T10:30:00Z",
        "displayName": "Jane Analyst",
        "partyId": "mybank::analyst001"
      }
    ]
  }
}`} language="typescript" title="get-deal.ts" />
            <h2 id="update-deal">PATCH /api/deals/[dealId]</h2>
            <p>Update deal metadata. Status changes require deal.status_change permission.</p>
            <CodeBlock code={`// Request
fetch('/api/deals/deal-uuid-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Deal Title',
    description: 'Modified description',
    status: 'committed',
    volume: "120000000"
  })
});

// Response
{
  "data": {
    "deal": {
      "id": "deal-uuid-123",
      "title": "Updated Deal Title",
      "status": "committed",
      "volume": "120000000",
      "updatedAt": "2024-01-25T15:45:00Z"
    }
  }
}`} language="typescript" title="update-deal.ts" />
            <h2 id="deal-messages">GET /api/deals/[dealId]/messages</h2>
            <p>Get deal message history. Requires deal.read_messages permission.</p>
            <CodeBlock code={`// Request
fetch('/api/deals/deal-uuid-123/messages');

// Response
{
  "data": [
    {
      "id": "message-uuid-1",
      "dealId": "deal-uuid-123",
      "content": "Deal terms have been finalized",
      "contentType": "text",
      "senderId": "user-uuid-456",
      "senderDisplayName": "John Trader",
      "senderPartyId": "mybank::trader001",
      "threadId": null,
      "createdAt": "2024-01-22T14:30:00Z"
    },
    {
      "id": "message-uuid-2",
      "dealId": "deal-uuid-123",
      "content": "Collateral documents attached",
      "contentType": "file",
      "senderId": "user-uuid-789",
      "senderDisplayName": "Jane Analyst",
      "senderPartyId": "mybank::analyst001",
      "fileUrl": "https://blob.vercel-storage.com/doc-uuid-123.pdf",
      "fileName": "collateral-docs.pdf",
      "fileSize": 245890,
      "createdAt": "2024-01-22T15:15:00Z"
    }
  ]
}`} language="typescript" title="deal-messages.ts" />
            <h2 id="send-message">POST /api/deals/[dealId]/messages</h2>
            <p>Send message to deal. Requires deal.send_message permission.</p>
            <CodeBlock code={`// Request
fetch('/api/deals/deal-uuid-123/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Ready to proceed with settlement',
    threadId: 'thread-uuid-456', // optional
    contentType: 'text'
  })
});

// Response
{
  "data": {
    "message": {
      "id": "new-message-uuid",
      "content": "Ready to proceed with settlement",
      "contentType": "text",
      "senderId": "user-uuid-123",
      "senderDisplayName": "Current User",
      "senderPartyId": "mybank::user123",
      "dealId": "deal-uuid-123",
      "createdAt": "2024-01-25T16:20:00Z"
    }
  }
}`} language="typescript" title="send-message.ts" />
            <h2 id="message-stream">GET /api/deals/[dealId]/messages/stream</h2>
            <p>Server-Sent Events endpoint for real-time messages. Requires deal.read_messages permission.</p>
            <CodeBlock code={`// Request
const eventSource = new EventSource('/api/deals/deal-uuid-123/messages/stream');

eventSource.addEventListener('connected', (event) => {
  console.log('Connected to deal stream');
});

eventSource.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  console.log('New message:', message);
});

eventSource.addEventListener('heartbeat', (event) => {
  console.log('Connection alive');
});

// Events sent:
// - connected: Initial connection confirmation
// - message: New message data
// - heartbeat: Keep-alive ping every 30s`} language="typescript" title="message-stream.ts" />
            <h2 id="upload-file">POST /api/deals/[dealId]/files</h2>
            <p>Upload file to deal. Requires deal.upload_file permission.</p>
            <CodeBlock code={`// Request
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/deals/deal-uuid-123/files', {
  method: 'POST',
  body: formData
});

// Response
{
  "data": {
    "message": {
      "id": "file-message-uuid",
      "content": "contract.pdf",
      "contentType": "file",
      "fileUrl": "/api/files/uploaded-file-uuid",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "createdAt": "2024-01-25T17:00:00Z"
    }
  }
}`} language="typescript" title="upload-file.ts" />
            <h2 id="add-participant">POST /api/deals/[dealId]/participants</h2>
            <p>Add participant to deal.</p>
            <CodeBlock code={`// Request
fetch('/api/deals/deal-uuid-123/participants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid-789',
    role: 'viewer' // optional
  })
});

// Response
{
  "data": {
    "participant": {
      "id": "new-participant-uuid",
      "dealId": "deal-uuid-123",
      "userId": "user-uuid-789",
      "role": "custodian",
      "joinedAt": "2024-01-25T17:30:00Z"
    }
  }
}`} language="typescript" title="add-participant.ts" />
            <h2 id="remove-participant">DELETE /api/deals/[dealId]/participants</h2>
            <p>Remove participant from deal.</p>
            <CodeBlock code={`// Request
fetch('/api/deals/deal-uuid-123/participants', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-uuid-789'
  })
});

// Response
{
  "data": {
    "success": true
  }
}`} language="typescript" title="remove-participant.ts" />
          </DocContent>
        );

      case 'api-admin':
        return (
          <DocContent sectionId="api-admin">
            <h1 id="api-admin">Admin API</h1>
            <p>
              Admin endpoints provide system-wide management capabilities. All endpoints require admin role.
            </p>
            <h2 id="analytics">GET /api/admin/analytics</h2>
            <p>Get aggregate system analytics and statistics.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/analytics');

// Response
{
  "data": {
    "userCount": 1247,
    "dealCount": 89,
    "flowCount": 23,
    "recentActivity": [
      {
        "type": "deal.created",
        "count": 5,
        "timestamp": "2024-01-25T16:00:00Z"
      },
      {
        "type": "user.registered",
        "count": 12,
        "timestamp": "2024-01-25T15:00:00Z"
      }
    ],
    "charts": {
      "dealVolume": [
        { "date": "2024-01-20", "volume": 250000000 },
        { "date": "2024-01-21", "volume": 180000000 },
        { "date": "2024-01-22", "volume": 320000000 }
      ],
      "userGrowth": [
        { "date": "2024-01-20", "users": 1200 },
        { "date": "2024-01-21", "users": 1215 },
        { "date": "2024-01-22", "users": 1247 }
      ]
    }
  }
}`} language="typescript" title="analytics.ts" />
            <h2 id="admin-deals">GET /api/admin/deals</h2>
            <p>List all deals across organization with filtering.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/deals?status=open&limit=50');

// Response
{
  "data": [
    {
      "id": "deal-uuid-123",
      "title": "ACME Corp Bond Issuance",
      "status": "open",
      "volume": "100000000",
      "participantCount": 4,
      "createdBy": "user-uuid-456",
      "createdAt": "2024-01-20T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 89,
    "totalPages": 2
  }
}`} language="typescript" title="admin-deals.ts" />
            <h2 id="admin-flows">GET /api/admin/flows</h2>
            <p>List all flows across organization with filtering.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/flows?status=published&template=true');

// Response
{
  "data": [
    {
      "id": "flow-uuid-123",
      "title": "Token Issuance Template",
      "status": "published",
      "isTemplate": true,
      "isPublic": true,
      "usageCount": 15,
      "createdBy": "admin-uuid-123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`} language="typescript" title="admin-flows.ts" />
            <h2 id="list-organizations">GET /api/admin/organizations</h2>
            <p>List all organizations in the system.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/organizations');

// Response
{
  "data": [
    {
      "id": "org-uuid-123",
      "name": "ACME Financial",
      "domain": "acme.com",
      "userCount": 25,
      "dealCount": 12,
      "flowCount": 8,
      "createdAt": "2024-01-10T08:00:00Z"
    },
    {
      "id": "org-uuid-456",
      "name": "Global Bank Corp",
      "domain": "globalbank.com",
      "userCount": 150,
      "dealCount": 45,
      "flowCount": 15,
      "createdAt": "2024-01-05T14:30:00Z"
    }
  ]
}`} language="typescript" title="list-organizations.ts" />
            <h2 id="update-organization">PATCH /api/admin/organizations/[orgId]</h2>
            <p>Update organization settings.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/organizations/org-uuid-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'ACME Financial Services',
    domain: 'acmefinancial.com',
    settings: {
      maxUsers: 100,
      maxDeals: 50,
      features: ['advanced-analytics', 'custom-templates']
    }
  })
});

// Response
{
  "data": {
    "organization": {
      "id": "org-uuid-123",
      "name": "ACME Financial Services",
      "domain": "acmefinancial.com",
      "settings": {
        "maxUsers": 100,
        "maxDeals": 50,
        "features": ["advanced-analytics", "custom-templates"]
      },
      "updatedAt": "2024-01-25T18:00:00Z"
    }
  }
}`} language="typescript" title="update-organization.ts" />
          </DocContent>
        );

      case 'api-billing':
        return (
          <DocContent sectionId="api-billing">
            <h1 id="api-billing">Billing API</h1>
            <p>
              Billing endpoints manage subscription plans, subscriptions, invoices, and payment methods.
              All endpoints require admin role.
            </p>
            <h2 id="list-plans">GET /api/admin/plans</h2>
            <p>List all subscription plans.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/plans');

// Response
{
  "data": [
    {
      "id": "plan-uuid-123",
      "name": "Professional",
      "tier": "pro",
      "priceAmount": 99900, // cents
      "priceCurrency": "USD",
      "interval": "monthly",
      "features": [
        "unlimited-flows",
        "advanced-analytics",
        "priority-support"
      ],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "plan-uuid-456",
      "name": "Enterprise",
      "tier": "enterprise",
      "priceAmount": 299900,
      "priceCurrency": "USD",
      "interval": "monthly",
      "features": [
        "unlimited-everything",
        "custom-integrations",
        "dedicated-support"
      ],
      "isActive": true
    }
  ]
}`} language="typescript" title="list-plans.ts" />
            <h2 id="create-plan">POST /api/admin/plans</h2>
            <p>Create new subscription plan.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Starter',
    tier: 'basic',
    priceAmount: 2900, // $29.00
    priceCurrency: 'USD',
    interval: 'monthly',
    features: [
      'up-to-5-flows',
      'basic-analytics',
      'email-support'
    ]
  })
});

// Response
{
  "data": {
    "plan": {
      "id": "new-plan-uuid",
      "name": "Starter",
      "tier": "basic",
      "priceAmount": 2900,
      "priceCurrency": "USD",
      "interval": "monthly",
      "features": ["up-to-5-flows", "basic-analytics", "email-support"],
      "isActive": true,
      "createdAt": "2024-01-25T18:30:00Z"
    }
  }
}`} language="typescript" title="create-plan.ts" />
            <h2 id="list-subscriptions">GET /api/admin/subscriptions</h2>
            <p>List all subscriptions.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/subscriptions?status=active');

// Response
{
  "data": [
    {
      "id": "sub-uuid-123",
      "orgId": "org-uuid-456",
      "planId": "plan-uuid-123",
      "status": "active",
      "currentPeriodStart": "2024-01-01T00:00:00Z",
      "currentPeriodEnd": "2024-02-01T00:00:00Z",
      "cancelAtPeriodEnd": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`} language="typescript" title="list-subscriptions.ts" />
            <h2 id="create-subscription">POST /api/admin/subscriptions</h2>
            <p>Create new subscription for organization.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orgId: 'org-uuid-789',
    planId: 'plan-uuid-123'
  })
});

// Response
{
  "data": {
    "subscription": {
      "id": "new-sub-uuid",
      "orgId": "org-uuid-789",
      "planId": "plan-uuid-123",
      "status": "active",
      "currentPeriodStart": "2024-01-25T18:45:00Z",
      "currentPeriodEnd": "2024-02-25T18:45:00Z",
      "createdAt": "2024-01-25T18:45:00Z"
    }
  }
}`} language="typescript" title="create-subscription.ts" />
            <h2 id="update-subscription">PATCH /api/admin/subscriptions/[subId]</h2>
            <p>Update subscription status.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/subscriptions/sub-uuid-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'canceled',
    cancelAtPeriodEnd: true
  })
});

// Response
{
  "data": {
    "subscription": {
      "id": "sub-uuid-123",
      "status": "canceled",
      "cancelAtPeriodEnd": true,
      "canceledAt": "2024-01-25T19:00:00Z",
      "updatedAt": "2024-01-25T19:00:00Z"
    }
  }
}`} language="typescript" title="update-subscription.ts" />
            <h2 id="list-invoices">GET /api/admin/invoices</h2>
            <p>List all invoices.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/invoices?orgId=org-uuid-456');

// Response
{
  "data": [
    {
      "id": "invoice-uuid-123",
      "orgId": "org-uuid-456",
      "subscriptionId": "sub-uuid-123",
      "amount": 99900,
      "currency": "USD",
      "status": "paid",
      "paidAt": "2024-01-01T12:00:00Z",
      "dueDate": "2024-01-15T23:59:59Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`} language="typescript" title="list-invoices.ts" />
            <h2 id="create-invoice">POST /api/admin/invoices</h2>
            <p>Create new invoice.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orgId: 'org-uuid-456',
    subscriptionId: 'sub-uuid-123',
    amount: 99900,
    currency: 'USD',
    dueDate: '2024-02-15T23:59:59Z',
    description: 'Professional Plan - February 2024'
  })
});

// Response
{
  "data": {
    "invoice": {
      "id": "new-invoice-uuid",
      "orgId": "org-uuid-456",
      "amount": 99900,
      "currency": "USD",
      "status": "pending",
      "dueDate": "2024-02-15T23:59:59Z",
      "description": "Professional Plan - February 2024",
      "createdAt": "2024-01-25T19:15:00Z"
    }
  }
}`} language="typescript" title="create-invoice.ts" />
            <h2 id="list-payment-methods">GET /api/admin/payment-methods</h2>
            <p>List payment methods for organization.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/payment-methods?orgId=org-uuid-456');

// Response
{
  "data": [
    {
      "id": "pm-uuid-123",
      "orgId": "org-uuid-456",
      "type": "canton_cc",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      "label": "Primary Wallet",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`} language="typescript" title="list-payment-methods.ts" />
            <h2 id="add-payment-method">POST /api/admin/payment-methods</h2>
            <p>Add new payment method.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/payment-methods', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'canton_cc',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c0532925a3',
    label: 'Secondary Wallet'
  })
});

// Response
{
  "data": {
    "paymentMethod": {
      "id": "new-pm-uuid",
      "type": "canton_cc",
      "walletAddress": "0x8ba1f109551bD432803012645Hac136c0532925a3",
      "label": "Secondary Wallet",
      "isDefault": false,
      "createdAt": "2024-01-25T19:30:00Z"
    }
  }
}`} language="typescript" title="add-payment-method.ts" />
          </DocContent>
        );

      case 'api-providers':
        return (
          <DocContent sectionId="api-providers">
            <h1 id="api-providers">Providers API</h1>
            <p>
              Provider endpoints manage service providers, applications, and approvals.
              All endpoints require admin role.
            </p>
            <h2 id="list-providers">GET /api/admin/providers</h2>
            <p>List all service providers.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/providers?category=strategy');

// Response
{
  "data": [
    {
      "id": "provider-uuid-123",
      "name": "QuantStrat Solutions",
      "category": "strategy",
      "description": "Advanced algorithmic trading strategies",
      "website": "https://quantstrat.com",
      "contactEmail": "partnerships@quantstrat.com",
      "isApproved": true,
      "applicationCount": 5,
      "createdAt": "2024-01-10T10:00:00Z"
    },
    {
      "id": "provider-uuid-456",
      "name": "DevFlow Technologies",
      "category": "development",
      "description": "Custom workflow development services",
      "website": "https://devflow.tech",
      "contactEmail": "hello@devflow.tech",
      "isApproved": true,
      "applicationCount": 12
    }
  ]
}`} language="typescript" title="list-providers.ts" />
            <h2 id="create-provider">POST /api/admin/providers</h2>
            <p>Create new service provider.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/providers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Creative Assets Inc',
    category: 'creative',
    description: 'Professional design and branding services',
    website: 'https://creativeassets.com',
    contactEmail: 'contact@creativeassets.com'
  })
});

// Response
{
  "data": {
    "provider": {
      "id": "new-provider-uuid",
      "name": "Creative Assets Inc",
      "category": "creative",
      "description": "Professional design and branding services",
      "website": "https://creativeassets.com",
      "contactEmail": "contact@creativeassets.com",
      "isApproved": false,
      "applicationCount": 0,
      "createdAt": "2024-01-25T20:00:00Z"
    }
  }
}`} language="typescript" title="create-provider.ts" />
            <h2 id="update-provider">PATCH /api/admin/providers/[providerId]</h2>
            <p>Update provider information.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/providers/provider-uuid-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'QuantStrat Solutions Pro',
    description: 'Advanced algorithmic trading and risk management',
    website: 'https://quantstratpro.com',
    isApproved: true
  })
});

// Response
{
  "data": {
    "provider": {
      "id": "provider-uuid-123",
      "name": "QuantStrat Solutions Pro",
      "description": "Advanced algorithmic trading and risk management",
      "website": "https://quantstratpro.com",
      "isApproved": true,
      "updatedAt": "2024-01-25T20:15:00Z"
    }
  }
}`} language="typescript" title="update-provider.ts" />
            <h2 id="apply-provider">POST /api/admin/providers/[providerId]/applications</h2>
            <p>Apply to work with a provider. Requires provider.apply permission.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/providers/provider-uuid-123/applications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orgId: 'org-uuid-456',
    message: 'We are interested in implementing advanced trading strategies for our repo platform'
  })
});

// Response
{
  "data": {
    "application": {
      "id": "app-uuid-789",
      "providerId": "provider-uuid-123",
      "orgId": "org-uuid-456",
      "status": "pending",
      "message": "We are interested in implementing advanced trading strategies for our repo platform",
      "createdAt": "2024-01-25T20:30:00Z"
    }
  }
}`} language="typescript" title="apply-provider.ts" />
            <h2 id="review-application">PATCH /api/admin/providers/[providerId]/applications/[appId]</h2>
            <p>Review and approve/reject provider application.</p>
            <CodeBlock code={`// Request
fetch('/api/admin/providers/provider-uuid-123/applications/app-uuid-789', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'approved'
  })
});

// Response
{
  "data": {
    "application": {
      "id": "app-uuid-789",
      "providerId": "provider-uuid-123",
      "orgId": "org-uuid-456",
      "status": "approved",
      "reviewedAt": "2024-01-25T20:45:00Z",
      "updatedAt": "2024-01-25T20:45:00Z"
    }
  }
}`} language="typescript" title="review-application.ts" />
          </DocContent>
        );

      default:
        return (
          <DocContent sectionId={activeSection}>
            <h1 id={activeSection}>{sections.find(s => s.id === activeSection || s.children?.find(c => c.id === activeSection))?.title || 'Documentation'}</h1>
            <p>This section is coming soon. Content will be added by other tasks.</p>
          </DocContent>
        );
    }
  };

  return (
    <DocLayout
      sections={sections}
      activeSection={activeSection}
      onSectionClick={handleSectionClick}
      renderSidebar={renderSidebar}
      renderTableOfContents={renderTableOfContents}
    >
      {renderContent()}
    </DocLayout>
  );
}