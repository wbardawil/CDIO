// ============================================================
// AI-CDIO — Evidence archive
//
// The verdict has to be defensible months later, so the original
// uploaded documents are kept, not just the extracted text. Stored
// in a PRIVATE Supabase Storage bucket, keyed by org + batch.
//
// Best-effort by design: archiving must never break the
// friction-killer. If storage isn't reachable, extraction still
// returns and the file is flagged "not archived" — honest, not
// silently lost.
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";

export const EVIDENCE_BUCKET = "audit-evidence";

let bucketEnsured = false;

async function ensureBucket(
  db: ReturnType<typeof createServiceClient>
): Promise<void> {
  if (bucketEnsured) return;
  // createBucket is idempotent enough for our purposes: a
  // "already exists" error is success.
  const { error } = await db.storage.createBucket(EVIDENCE_BUCKET, {
    public: false,
  });
  if (error && !/exist/i.test(error.message)) {
    throw error;
  }
  bucketEnsured = true;
}

function safeName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/_{2,}/g, "_")
      .slice(-120) || "file"
  );
}

/** Archive one original file. Returns the storage path on success,
 *  or null on any failure (caller treats null as "not archived"). */
export async function storeEvidence(
  orgId: string,
  batchId: string,
  index: number,
  name: string,
  contentType: string,
  buf: Buffer
): Promise<string | null> {
  try {
    const db = createServiceClient();
    await ensureBucket(db);
    const path = `org/${orgId}/${batchId}/${index}-${safeName(name)}`;
    const { error } = await db.storage
      .from(EVIDENCE_BUCKET)
      .upload(path, buf, {
        contentType: contentType || "application/octet-stream",
        upsert: true,
      });
    if (error) return null;
    return path;
  } catch {
    return null;
  }
}
