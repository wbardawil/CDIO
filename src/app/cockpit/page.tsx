import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { listInitiatives } from "@/lib/cockpit/db";
import {
  INITIATIVE_TYPE_LABELS,
  STAGE_LABELS,
  STAGES,
} from "@/types/cockpit";
import { NewInitiativeForm } from "@/components/cockpit/new-initiative-form";
import { card, eyebrow } from "@/components/cockpit/styles";

export const metadata = { title: "Projects — CDIO Cockpit" };

export default async function CockpitHome() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const initiatives = await listInitiatives(userId);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hair bg-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/cockpit" className="font-serif text-lg font-semibold text-ink">
            CDIO Review Cockpit
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className={eyebrow}>Your projects</p>
        <h1 className="mt-3 text-3xl text-ink">Initiatives</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One workspace per initiative. Pick one to enter it, or start a new one.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            {initiatives.length === 0 ? (
              <div className={`${card} p-8`}>
                <h2 className="text-xl text-ink">No initiatives yet</h2>
                <p className="mt-2 text-muted">
                  Start one on the right. Then drop in its first documents
                  &mdash; meeting notes, a vendor proposal, anything you have
                  &mdash; and the cockpit takes it from there.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {initiatives.map((it) => {
                  const stageIndex = STAGES.indexOf(it.stage);
                  return (
                    <li key={it.id}>
                      <Link
                        href={`/cockpit/${it.id}`}
                        className={`${card} block p-5 transition-colors hover:border-hair-strong`}
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="text-lg text-ink">{it.name}</h3>
                          <span className="shrink-0 text-xs text-faint">
                            {it.initiativeType
                              ? INITIATIVE_TYPE_LABELS[it.initiativeType]
                              : "Initiative"}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5">
                          {STAGES.map((s, i) => (
                            <span
                              key={s}
                              className={`h-1.5 flex-1 rounded-full ${
                                i <= stageIndex ? "bg-evergreen" : "bg-hair"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-muted">
                          {STAGE_LABELS[it.stage]}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside>
            <div className={`${card} p-6`}>
              <h2 className="text-lg text-ink">New initiative</h2>
              <p className="mt-1 text-sm text-muted">
                Name the project and pick its kind.
              </p>
              <div className="mt-4">
                <NewInitiativeForm />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
