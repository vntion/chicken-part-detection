import type { ReactNode } from "react";

type Props = { children: ReactNode };

function Main({ children }: Props) {
  return (
    <main className="flex-1 overflow-auto p-10">
      <div className="mx-auto max-w-5xl space-y-6">{children}</div>
    </main>
  );
}

export default Main;
