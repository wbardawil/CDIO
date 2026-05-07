// ============================================================
// AI-CDIO — Network Catalog types (Phase 1D Day 25, P0 privacy)
// ============================================================

export type CatalogEntryType = "vendor" | "partner" | "individual";

export interface NetworkCatalogEntry {
  id: string;
  created_at: string;
  updated_at: string;
  practitioner_id: string;
  entry_type: CatalogEntryType;
  name: string;
  category: string | null;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  private_notes: string | null;
  pricing_notes: string | null;
  rating: number | null;
  engagements_used: number;
  tags: string[];
  last_engaged_at: string | null;
}

export const ENTRY_TYPE_LABEL: Record<CatalogEntryType, string> = {
  vendor: "Vendor",
  partner: "Partner",
  individual: "Individual",
};
