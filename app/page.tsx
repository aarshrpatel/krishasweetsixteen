export default function Home() {
  return (
    <main className="confetti-bg flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-[color:var(--accent)]">
          You&apos;re invited
        </p>
        <h1 className="font-display mt-6 text-5xl leading-tight text-[color:var(--card)] sm:text-6xl">
          Krisha&apos;s Sweet&nbsp;Sixteen
        </h1>
        <div className="mt-8 flex items-center justify-center gap-3 text-[color:var(--accent)]">
          <span className="h-px w-10 bg-[color:var(--primary)]" />
          <span className="font-display text-lg italic">Sweet 16</span>
          <span className="h-px w-10 bg-[color:var(--primary)]" />
        </div>
        <p className="mx-auto mt-8 max-w-md text-balance text-[color:var(--muted-on-bg)]">
          To RSVP, please open the personal link sent to your family. We
          can&apos;t wait to celebrate with you.
        </p>
      </div>
    </main>
  );
}
