import React, { useMemo } from "react";

type Range = { start: number; end: number; type: string };

function mergeRanges(ranges: Range[]) {
  // assumes non-overlapping per type; if overlaps, we still slice safely
  const sorted = [...ranges].sort((a,b)=>a.start-b.start || a.end-b.end);
  const merged: Range[] = [];
  for (const r of sorted) {
    const last = merged[merged.length-1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else merged.push({ ...r });
  }
  return merged;
}

interface Props {
  text: string;
  evidence?: {
    name?: { start:number; end:number }[];
    contact?: { email?: {start:number; end:number}[]; phone?: {start:number; end:number}[]; links?: {start:number; end:number}[] };
    skills?: { start:number; end:number; field?:string }[];
  };
}

export default function ResumeViewer({ text, evidence }: Props) {
  const ranges: Range[] = useMemo(() => {
    const out: Range[] = [];
    if (!text || !evidence) return out;
    for (const r of evidence.name || []) out.push({ ...r, type: "name" });
    for (const r of evidence.contact?.email || []) out.push({ ...r, type: "email" });
    for (const r of evidence.contact?.phone || []) out.push({ ...r, type: "phone" });
    for (const r of evidence.contact?.links || []) out.push({ ...r, type: "link" });
    for (const r of evidence.skills || []) out.push({ start: r.start, end: r.end, type: "skill" });
    return mergeRanges(out);
  }, [text, evidence]);

  // slice text into spans
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const color = (t:string) => ({
    name: "bg-yellow-200",
    email: "bg-green-200",
    phone: "bg-blue-200",
    link: "bg-purple-200",
    skill: "bg-pink-200",
  }[t] || "bg-gray-200");

  for (const r of ranges) {
    if (r.start > cursor) {
      parts.push(<span key={`t-${cursor}`} className="whitespace-pre-wrap">{text.slice(cursor, r.start)}</span>);
    }
    parts.push(
      <mark key={`m-${r.start}-${r.end}`} className={`${color(r.type)} rounded px-0.5`}>
        {text.slice(r.start, r.end)}
      </mark>
    );
    cursor = r.end;
  }
  if (cursor < text.length) parts.push(<span key={`t-end`} className="whitespace-pre-wrap">{text.slice(cursor)}</span>);

  return (
    <div className="prose max-w-none">
      <div className="text-xs mb-2 flex gap-2 flex-wrap">
        <Legend color="bg-yellow-200" label="Name" />
        <Legend color="bg-green-200" label="Email" />
        <Legend color="bg-blue-200" label="Phone" />
        <Legend color="bg-purple-200" label="Link" />
        <Legend color="bg-pink-200" label="Skill" />
      </div>
      <div className="border rounded p-3 max-h-[60vh] overflow-auto font-mono text-sm leading-6">
        {parts}
      </div>
    </div>
  );
}

function Legend({ color, label }:{ color:string; label:string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className={`inline-block w-3 h-3 rounded ${color}`} />
      {label}
    </span>
  );
}
