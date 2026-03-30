// Run with: node scripts/ingest-playbook.js
// Ingests the playbook markdown files into Supabase for RAG retrieval

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jowfdcontbpetgldrzix.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_KEY) {
  // Try reading from .env.local
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    if (match) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = match[1].trim();
    }
  }
}

const db = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY
);

const PLAYBOOK_DIR = path.resolve(__dirname, "../../CSIO - Playbook");

function chunkMarkdown(content, sourceFile) {
  const chunks = [];
  const moduleNumbers = extractModuleNumbers(sourceFile, content);
  const domainCluster = inferDomainCluster(moduleNumbers);
  const contentType = inferContentType(sourceFile);

  const sections = content.split(/^## /gm);

  for (const section of sections) {
    if (section.trim().length < 50) continue;

    const lines = section.split("\n");
    const sectionTitle = lines[0]?.trim().replace(/^#+\s*/, "") || "Untitled";
    const sectionContent = section.trim();

    if (sectionContent.length > 2000) {
      const subsections = sectionContent.split(/^### /gm);
      for (const sub of subsections) {
        if (sub.trim().length < 50) continue;
        const subLines = sub.split("\n");
        const subTitle = subLines[0]?.trim().replace(/^#+\s*/, "") || sectionTitle;

        chunks.push({
          content: sub.trim().substring(0, 3000),
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

function extractModuleNumbers(filename, content) {
  const modules = [];
  const fileMatch = filename.match(/MODULE_(\d+)/i);
  if (fileMatch) modules.push(parseInt(fileMatch[1]));

  const prefixMatch = filename.match(/^(\d+)_/);
  if (prefixMatch) {
    const num = parseInt(prefixMatch[1]);
    if (num >= 2 && num <= 17) modules.push(num - 1); // offset: file 02 = module 1 content
  }

  const contentMatches = [...content.matchAll(/Module\s+(\d+)/gi)];
  for (const match of contentMatches) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 16 && !modules.includes(num)) {
      modules.push(num);
    }
  }

  return [...new Set(modules)].sort((a, b) => a - b);
}

function inferDomainCluster(modules) {
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

function inferContentType(filename) {
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

async function main() {
  console.log("Playbook directory:", PLAYBOOK_DIR);

  if (!fs.existsSync(PLAYBOOK_DIR)) {
    console.error("Playbook directory not found!");
    process.exit(1);
  }

  const files = fs.readdirSync(PLAYBOOK_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Found ${files.length} playbook files\n`);

  // Clear existing chunks
  const { error: delError } = await db
    .from("playbook_chunks")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (delError) console.warn("Clear warning:", delError.message);
  else console.log("Cleared existing chunks\n");

  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(PLAYBOOK_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const chunks = chunkMarkdown(content, file);

    if (chunks.length === 0) {
      console.log(`  ${file}: 0 chunks (skipped)`);
      continue;
    }

    const rows = chunks.map((c) => ({
      content: c.content,
      metadata: c.metadata,
    }));

    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await db.from("playbook_chunks").insert(batch);
      if (error) {
        console.error(`  ${file} batch ${i}: ERROR -`, error.message);
      }
    }

    console.log(`  ${file}: ${chunks.length} chunks (modules: [${chunks[0]?.metadata.module_numbers}], type: ${chunks[0]?.metadata.content_type})`);
    totalChunks += chunks.length;
  }

  console.log(`\n✓ Ingestion complete: ${totalChunks} chunks from ${files.length} files`);

  // Verify
  const { data, error } = await db.from("playbook_chunks").select("id", { count: "exact" });
  console.log(`✓ Verified: ${data?.length ?? 0} chunks in database`);
}

main().catch(console.error);
