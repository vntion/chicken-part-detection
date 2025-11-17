import type { ReactNode } from "react";

type Props = { children: ReactNode };

function Main({ children }: Props) {
  return <main className="flex-1 overflow-auto p-10">{children}</main>;
}

export default Main;
