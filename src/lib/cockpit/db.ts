// ============================================================
// CDIO Review Cockpit — server-only data layer
//
// All DB access for the cockpit goes through here. It uses the
// Supabase service_role key (createServiceClient) — the browser
// never holds a database key. Every function takes the Clerk
// userId and filters owner_user_id on every read and write;
// ownership is enforced here, in one place. The composite FK in
// schema-v26 backstops it at the database.
//
// SERVER ONLY — never import this into a client component.
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";
import type {
  Brief,
  CDIOBrief,
  ChatMessage,
  Constraint,
  ConstraintKind,
  DocumentMeta,
  Initiative,
  InitiativeType,
  Stage,
} from "@/types/cockpit";
import { briefStatus } from "@/types/cockpit";

function sb() {
  return createServiceClient();
}

// ---- Row mappers (snake_case DB → camelCase types) ----

type Row = Record<string, unknown>;

function toInitiative(r: Row): Initiative {
  return {
    id: r.id as string,
    ownerUserId: r.owner_user_id as string,
    name: r.name as string,
    initiativeType: (r.initiative_type as InitiativeType | null) ?? null,
    stage: r.stage as Stage,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toDocument(r: Row): DocumentMeta {
  return {
    id: r.id as string,
    initiativeId: r.initiative_id as string,
    filename: r.filename as string,
    sha256: r.sha256 as string,
    parseOk: r.parse_ok as boolean,
    parseNote: (r.parse_note as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

function toConstraint(r: Row): Constraint {
  return {
    id: r.id as string,
    initiativeId: r.initiative_id as string,
    kind: r.kind as ConstraintKind,
    label: r.label as string,
    value: (r.value as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

function toBrief(r: Row): Brief {
  return {
    id: r.id as string,
    initiativeId: r.initiative_id as string,
    version: r.version as number,
    body: r.body as CDIOBrief,
    status: r.status as "complete" | "partial",
    createdAt: r.created_at as string,
  };
}

// ---- Initiatives ----

export async function createInitiative(
  userId: string,
  input: { name: string; initiativeType: InitiativeType | null }
): Promise<Initiative> {
  const { data, error } = await sb()
    .from("initiatives")
    .insert({
      owner_user_id: userId,
      name: input.name,
      initiative_type: input.initiativeType,
    })
    .select()
    .single();
  if (error) throw new Error(`createInitiative: ${error.message}`);
  return toInitiative(data);
}

export async function listInitiatives(userId: string): Promise<Initiative[]> {
  const { data, error } = await sb()
    .from("initiatives")
    .select()
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`listInitiatives: ${error.message}`);
  return (data ?? []).map(toInitiative);
}

/** Fetch one initiative, but only if `userId` owns it. Returns
 *  null otherwise — the caller treats null as 404. */
export async function getInitiative(
  userId: string,
  id: string
): Promise<Initiative | null> {
  const { data, error } = await sb()
    .from("initiatives")
    .select()
    .eq("id", id)
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`getInitiative: ${error.message}`);
  return data ? toInitiative(data) : null;
}

export async function setInitiativeStage(
  userId: string,
  id: string,
  stage: Stage
): Promise<void> {
  const { error } = await sb()
    .from("initiatives")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_user_id", userId);
  if (error) throw new Error(`setInitiativeStage: ${error.message}`);
}

// ---- Documents ----

export async function addDocument(
  userId: string,
  initiativeId: string,
  input: {
    filename: string;
    sha256: string;
    extractedText: string;
    parseOk: boolean;
    parseNote: string | null;
  }
): Promise<DocumentMeta> {
  const { data, error } = await sb()
    .from("documents")
    .insert({
      initiative_id: initiativeId,
      owner_user_id: userId,
      filename: input.filename,
      sha256: input.sha256,
      extracted_text: input.extractedText,
      parse_ok: input.parseOk,
      parse_note: input.parseNote,
    })
    .select()
    .single();
  if (error) throw new Error(`addDocument: ${error.message}`);
  return toDocument(data);
}

export async function listDocuments(
  userId: string,
  initiativeId: string
): Promise<DocumentMeta[]> {
  const { data, error } = await sb()
    .from("documents")
    .select("id, initiative_id, filename, sha256, parse_ok, parse_note, created_at")
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listDocuments: ${error.message}`);
  return (data ?? []).map(toDocument);
}

/** The parsed text of every document, for the extractor. */
export async function getDocumentTexts(
  userId: string,
  initiativeId: string
): Promise<{ filename: string; text: string }[]> {
  const { data, error } = await sb()
    .from("documents")
    .select("filename, extracted_text")
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId)
    .eq("parse_ok", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getDocumentTexts: ${error.message}`);
  return (data ?? []).map((r) => ({
    filename: r.filename as string,
    text: (r.extracted_text as string) ?? "",
  }));
}

// ---- Constraints ----

/** Replace the whole constraint set for an initiative (the Frame
 *  panel saves the list as a unit). */
export async function replaceConstraints(
  userId: string,
  initiativeId: string,
  items: { kind: ConstraintKind; label: string; value: string | null }[]
): Promise<Constraint[]> {
  const client = sb();
  const del = await client
    .from("constraints")
    .delete()
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId);
  if (del.error) throw new Error(`replaceConstraints(delete): ${del.error.message}`);

  if (items.length === 0) return [];

  const { data, error } = await client
    .from("constraints")
    .insert(
      items.map((c) => ({
        initiative_id: initiativeId,
        owner_user_id: userId,
        kind: c.kind,
        label: c.label,
        value: c.value,
      }))
    )
    .select();
  if (error) throw new Error(`replaceConstraints(insert): ${error.message}`);
  return (data ?? []).map(toConstraint);
}

export async function listConstraints(
  userId: string,
  initiativeId: string
): Promise<Constraint[]> {
  const { data, error } = await sb()
    .from("constraints")
    .select()
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listConstraints: ${error.message}`);
  return (data ?? []).map(toConstraint);
}

// ---- Briefs (append-only, versioned) ----

/** Insert the next brief version. Version = prior max + 1.
 *  Single-user v1: a compute-then-insert race is acceptable — the
 *  UNIQUE(initiative_id, version) constraint rejects a collision
 *  rather than silently corrupting history. */
export async function insertBriefVersion(
  userId: string,
  initiativeId: string,
  body: CDIOBrief
): Promise<Brief> {
  const latest = await getLatestBrief(userId, initiativeId);
  const version = (latest?.version ?? 0) + 1;
  const { data, error } = await sb()
    .from("briefs")
    .insert({
      initiative_id: initiativeId,
      owner_user_id: userId,
      version,
      body,
      cold_open: body.coldOpen,
      gate: body.gate,
      status: briefStatus(body),
    })
    .select()
    .single();
  if (error) throw new Error(`insertBriefVersion: ${error.message}`);
  return toBrief(data);
}

export async function getLatestBrief(
  userId: string,
  initiativeId: string
): Promise<Brief | null> {
  const { data, error } = await sb()
    .from("briefs")
    .select()
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestBrief: ${error.message}`);
  return data ? toBrief(data) : null;
}

/** All versions, newest first — the project timeline, and the
 *  basis for the deferred "what changed" view. */
export async function listBriefVersions(
  userId: string,
  initiativeId: string
): Promise<Brief[]> {
  const { data, error } = await sb()
    .from("briefs")
    .select()
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId)
    .order("version", { ascending: false });
  if (error) throw new Error(`listBriefVersions: ${error.message}`);
  return (data ?? []).map(toBrief);
}

// ---- Chat messages ----

function toMessage(r: Row): ChatMessage {
  return {
    id: r.id as string,
    initiativeId: r.initiative_id as string,
    role: r.role as "user" | "assistant",
    content: r.content as string,
    createdAt: r.created_at as string,
  };
}

export async function addMessage(
  userId: string,
  initiativeId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  const { data, error } = await sb()
    .from("messages")
    .insert({
      initiative_id: initiativeId,
      owner_user_id: userId,
      role,
      content,
    })
    .select()
    .single();
  if (error) throw new Error(`addMessage: ${error.message}`);
  return toMessage(data);
}

export async function listMessages(
  userId: string,
  initiativeId: string
): Promise<ChatMessage[]> {
  const { data, error } = await sb()
    .from("messages")
    .select()
    .eq("owner_user_id", userId)
    .eq("initiative_id", initiativeId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listMessages: ${error.message}`);
  return (data ?? []).map(toMessage);
}
