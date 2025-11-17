import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

function Container({ children }: Props) {
  return <div className="flex min-h-screen">{children}</div>;
}

export default Container;
