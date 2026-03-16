import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
