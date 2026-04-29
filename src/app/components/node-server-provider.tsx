"use client";

import { useEffect } from "react";
import { startNodeServer } from "../lib/node-server";

export default function NodeServerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    startNodeServer().catch(console.error);
  }, []);

  return <>{children}</>;
}
