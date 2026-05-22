import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { btnPrimary, eyebrow } from "@/components/cockpit/styles";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-serif text-lg font-semibold text-ink">
          CDIO Review Cockpit
        </span>
        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <Link href="/cockpit" className={btnPrimary}>
              Open the cockpit
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link href="/sign-up" className={btnPrimary}>
              Get started
            </Link>
          </Show>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className={eyebrow}>The advisor&rsquo;s desk</p>
        <h1 className="mt-4 text-4xl text-ink sm:text-5xl">
          A project&rsquo;s raw material, turned into one brief you can act on.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Drop in the meeting notes, the vendor proposals, the documents. The
          cockpit reads them against the CDIO methodology and hands back where
          the project stands, what was found, what is still unknown, and what
          to do next &mdash; with the one question you should be asking
          tomorrow.
        </p>
        <div className="mt-10">
          <Show when="signed-in">
            <Link href="/cockpit" className={btnPrimary}>
              Open the cockpit
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-up" className={btnPrimary}>
              Get started
            </Link>
          </Show>
        </div>
      </main>
    </div>
  );
}
