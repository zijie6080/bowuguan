import { notFound } from "next/navigation";
import { EXHIBIT_META } from "@/exhibits/meta";
import ExhibitClient from "@/components/ExhibitClient";

export function generateStaticParams() {
  return EXHIBIT_META.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = EXHIBIT_META.find((e) => e.id === id);
  return { title: meta ? `${meta.title} · 反直觉博物馆` : "反直觉博物馆" };
}

export default async function ExhibitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!EXHIBIT_META.some((e) => e.id === id)) notFound();
  return <ExhibitClient id={id} />;
}
