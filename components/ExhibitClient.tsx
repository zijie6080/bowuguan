"use client";

import { getExhibit } from "@/exhibits";
import ExhibitShell from "./ExhibitShell";

export default function ExhibitClient({ id }: { id: string }) {
  const def = getExhibit(id);
  if (!def) return null;
  return <ExhibitShell def={def} />;
}
