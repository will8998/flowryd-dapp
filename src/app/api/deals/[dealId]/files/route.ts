import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, messages } from '@/db/schema';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/json',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
) {
  const { dealId } = await params;

  const token = req.cookies.get('flowryd-access-token')?.value;
  if (!token) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
  }

  let user: { sub: string; orgId: string; role: 'admin' | 'editor' | 'viewer' };
  try {
    user = await verifyAccessToken(token);
  } catch {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 });
  }

  if (user.role === 'viewer') {
    return Response.json({ error: { code: 'FORBIDDEN', message: 'Viewers cannot upload files' } }, { status: 403 });
  }

  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.orgId, user.orgId)))
    .limit(1);

  if (!deal) {
    return Response.json({ error: { code: 'NOT_FOUND', message: 'Deal not found' } }, { status: 404 });
  }

  const [participant] = await db
    .select({ id: dealParticipants.id })
    .from(dealParticipants)
    .where(and(eq(dealParticipants.dealId, dealId), eq(dealParticipants.userId, user.sub)))
    .limit(1);

  if (!participant) {
    return Response.json({ error: { code: 'FORBIDDEN', message: 'Not a participant' } }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const threadId = formData.get('threadId') as string | null;

  if (!file) {
    return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'No file provided' } }, { status: 422 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'File exceeds 10MB limit' } }, { status: 422 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'File type not allowed' } }, { status: 422 });
  }

  const blob = await put(`deals/${dealId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });

  const [message] = await db
    .insert(messages)
    .values({
      dealId,
      threadId: threadId || undefined,
      senderId: user.sub,
      content: `Uploaded file: ${file.name}`,
      contentType: 'file',
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
    })
    .returning();

  const reqMeta = extractRequestMeta(req);
  logAudit({
    userId: user.sub,
    orgId: user.orgId,
    action: 'file.upload',
    resourceType: 'message',
    resourceId: message.id,
    metadata: { dealId, fileName: file.name, fileSize: file.size },
    ...reqMeta,
  });

  return successResponse({ message, blob: { url: blob.url } }, 201);
}
