// ============================================================
// AI-CDIO — Playbook RAG Retrieval
// Searches ingested playbook chunks for relevant context
// Uses PostgreSQL full-text search (tsvector)
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";

interface RetrievedChunk {
  content: string;
  metadata: {
    source_file: string;
    module_numbers: number[];
    domain_cluster: string;
    content_type: string;
    section_title: string;
  };
  relevance: number;
}

// --- Search playbook by keyword/topic ---

export async function searchPlaybook(
  query: string,
  options?: {
    moduleNumbers?: number[];
    contentType?: string;
    domainCluster?: string;
    limit?: number;
  }
): Promise<RetrievedChunk[]> {
  const db = createServiceClient();
  const limit = options?.limit ?? 5;

  // Build the query — use ilike for flexible matching
  let dbQuery = db
    .from("playbook_chunks")
    .select("content, metadata");

  // Filter by module numbers if specified
  if (options?.moduleNumbers && options.moduleNumbers.length > 0) {
    // Use contains operator for jsonb array
    dbQuery = dbQuery.or(
      options.moduleNumbers
        .map((m) => `metadata->module_numbers.cs.{${m}}`)
        .join(",")
    );
  }

  // Filter by content type
  if (options?.contentType) {
    dbQuery = dbQuery.eq("metadata->>content_type", options.contentType);
  }

  // Filter by domain cluster
  if (options?.domainCluster) {
    dbQuery = dbQuery.eq("metadata->>domain_cluster", options.domainCluster);
  }

  // Text search using ilike on content
  // Split query into keywords and search for any match
  const keywords = query.toLowerCase().split(/\s+/).filter((k) => k.length > 2);

  if (keywords.length > 0) {
    const searchFilter = keywords
      .map((k) => `content.ilike.%${k}%`)
      .join(",");
    dbQuery = dbQuery.or(searchFilter);
  }

  const { data, error } = await dbQuery.limit(limit);

  if (error) {
    console.error("Playbook search error:", error.message);
    return [];
  }

  // Score results by keyword match count for ranking
  const scored = (data ?? []).map((row) => {
    const contentLower = row.content.toLowerCase();
    const matchCount = keywords.filter((k) => contentLower.includes(k)).length;
    return {
      content: row.content,
      metadata: row.metadata,
      relevance: matchCount / Math.max(keywords.length, 1),
    };
  });

  // Sort by relevance
  scored.sort((a, b) => b.relevance - a.relevance);

  return scored.slice(0, limit);
}

// --- Get playbook context for a specific module ---

export async function getModuleContext(moduleNumber: number): Promise<string> {
  const chunks = await searchPlaybook(`module ${moduleNumber}`, {
    moduleNumbers: [moduleNumber],
    limit: 8,
  });

  if (chunks.length === 0) return "";

  return chunks
    .map((c) => `[${c.metadata.section_title}]\n${c.content}`)
    .join("\n\n---\n\n");
}

// --- Get playbook context for an industry ---

export async function getIndustryContext(industry: string): Promise<string> {
  const chunks = await searchPlaybook(industry, {
    contentType: "adaptation",
    limit: 5,
  });

  if (chunks.length === 0) return "";

  return chunks
    .map((c) => `[${c.metadata.section_title}]\n${c.content}`)
    .join("\n\n---\n\n");
}

// --- Get playbook context for roadmap generation ---

export async function getRoadmapContext(
  moduleNumbers: number[],
  orgSize: string,
  industry: string
): Promise<string> {
  const [moduleChunks, roadmapChunks, adaptationChunks] = await Promise.all([
    searchPlaybook(
      moduleNumbers.map((m) => `module ${m}`).join(" "),
      { moduleNumbers, contentType: "module", limit: 5 }
    ),
    searchPlaybook("roadmap quick win milestone", {
      contentType: "roadmap",
      limit: 3,
    }),
    searchPlaybook(`${orgSize} ${industry}`, {
      contentType: "adaptation",
      limit: 3,
    }),
  ]);

  const allChunks = [...moduleChunks, ...roadmapChunks, ...adaptationChunks];
  if (allChunks.length === 0) return "";

  return allChunks
    .map((c) => `[${c.metadata.source_file} > ${c.metadata.section_title}]\n${c.content}`)
    .join("\n\n---\n\n");
}
