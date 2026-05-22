import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  getInitiative,
  getLatestBrief,
  listConstraints,
  listDocuments,
} from "@/lib/cockpit/db";
import { Workspace } from "@/components/cockpit/workspace";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return { title: "CDIO Cockpit" };
  const initiative = await getInitiative(userId, id);
  return { title: initiative ? `${initiative.name} — CDIO Cockpit` : "CDIO Cockpit" };
}

export default async function InitiativePage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const initiative = await getInitiative(userId, id);
  if (!initiative) notFound();

  const [documents, constraints, brief] = await Promise.all([
    listDocuments(userId, id),
    listConstraints(userId, id),
    getLatestBrief(userId, id),
  ]);

  return (
    <Workspace
      initiative={initiative}
      documents={documents}
      constraints={constraints}
      brief={brief}
    />
  );
}
