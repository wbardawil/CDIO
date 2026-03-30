// ============================================================
// AI-CDIO — Playbook Ingestion Pipeline
// Chunks markdown files and stores them in Supabase for RAG retrieval
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";
import * as fs from "fs";
import * as path from "path";

interface PlaybookChunk {
  content: string;
  metadata: {
    source_file: string;
    module_numbers: number[];
    domain_cluster: string;
    content_type: string;
    section_title: string;
  };
}

// --- Chunk a markdown file into sections ---

function chunkMarkdown(content: string, sourceFile: string): PlaybookChunk[] {
  const chunks: PlaybookChunk[] = [];
  const moduleNumbers = extractModuleNumbers(sourceFile, content);
  const domainCluster = inferDomainCluster(moduleNumbers);
  const contentType = inferContentType(sourceFile);

  // Split by ## headings (level 2)
  const sections = content.split(/^## /gm);

  for (const section of sections) {
    if (section.trim().length < 50) continue; // skip tiny sections

    const lines = section.split("\n");
    const sectionTitle = lines[0]?.trim().replace(/^#+\s*/, "") ?? "Untitled";
    const sectionContent = section.trim();

    // If section is too large (>2000 chars), split by ### headings
    if (sectionContent.length > 2000) {
      const subsections = sectionContent.split(/^### /gm);
      for (const sub of subsections) {
        if (sub.trim().length < 50) continue;
        const subLines = sub.split("\n");
        const subTitle = subLines[0]?.trim().replace(/^#+\s*/, "") ?? sectionTitle;

        chunks.push({
          content: sub.trim().substring(0, 3000), // cap at 3000 chars
          metadata: {
            source_file: sourceFile,
            module_numbers: moduleNumbers,
            domain_cluster: domainCluster,
            content_type: contentType,
            section_title: subTitle,
          },
        });
      }
    } else {
      chunks.push({
        content: sectionContent,
        metadata: {
          source_file: sourceFile,
          module_numbers: moduleNumbers,
          domain_cluster: domainCluster,
          content_type: contentType,
          section_title: sectionTitle,
        },
      });
    }
  }

  return chunks;
}

// --- Extract module numbers from filename and content ---

function extractModuleNumbers(filename: string, content: string): number[] {
  const modules: number[] = [];

  // From filename: "01_MODULE_02_..." -> module 2
  const fileMatch = filename.match(/MODULE_(\d+)/i);
  if (fileMatch) modules.push(parseInt(fileMatch[1]));

  // From filename prefix: "01_ASSESSMENT" -> general
  const prefixMatch = filename.match(/^(\d+)_/);
  if (prefixMatch) {
    const num = parseInt(prefixMatch[1]);
    if (num >= 1 && num <= 17) modules.push(num);
  }

  // From content: "Module 5:" references
  const contentMatches = content.matchAll(/Module\s+(\d+)/gi);
  for (const match of contentMatches) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 16 && !modules.includes(num)) {
      modules.push(num);
    }
  }

  return [...new Set(modules)].sort((a, b) => a - b);
}

// --- Infer domain cluster from module numbers ---

function inferDomainCluster(modules: number[]): string {
  if (modules.length === 0) return "general";
  const m = modules[0];
  if ([3, 4].includes(m)) return "infrastructure";
  if ([5].includes(m)) return "security";
  if ([6, 8].includes(m)) return "data_ai";
  if ([7, 9].includes(m)) return "digital_products";
  if ([1, 10, 11, 16].includes(m)) return "leadership";
  if ([12, 13].includes(m)) return "financial";
  if ([14, 15].includes(m)) return "delivery";
  if ([2].includes(m)) return "strategy";
  return "general";
}

// --- Infer content type from filename ---

function inferContentType(filename: string): string {
  const f = filename.toLowerCase();
  if (f.includes("assessment")) return "assessment";
  if (f.includes("roadmap")) return "roadmap";
  if (f.includes("engagement")) return "engagement";
  if (f.includes("value") || f.includes("roi")) return "value";
  if (f.includes("adaptation") || f.includes("customer")) return "adaptation";
  if (f.includes("module")) return "module";
  if (f.includes("overview") || f.includes("index")) return "overview";
  if (f.includes("budget")) return "financial";
  return "general";
}

// --- Main ingestion function ---

export async function ingestPlaybook(playbookDir: string) {
  const db = createServiceClient();

  // Read all markdown files
  const files = fs.readdirSync(playbookDir).filter((f) => f.endsWith(".md"));
  console.log(`Found ${files.length} playbook files to ingest`);

  let totalChunks = 0;

  // Clear existing chunks
  await db.from("playbook_chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Cleared existing chunks");

  for (const file of files) {
    const filePath = path.join(playbookDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const chunks = chunkMarkdown(content, file);

    if (chunks.length === 0) continue;

    // Insert chunks (without embeddings for now — using full-text search)
    const rows = chunks.map((c) => ({
      content: c.content,
      metadata: c.metadata,
    }));

    const { error } = await db.from("playbook_chunks").insert(rows);

    if (error) {
      console.error(`Error ingesting ${file}:`, error.message);
    } else {
      console.log(`  ${file}: ${chunks.length} chunks`);
      totalChunks += chunks.length;
    }
  }

  console.log(`\nIngestion complete: ${totalChunks} chunks from ${files.length} files`);
  return { files: files.length, chunks: totalChunks };
}
