"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { formatEnum } from "@/lib/utils";

export function CandidatesTable() {
  const [search, setSearch] = useState("");
  const candidates = useQuery(api.candidates.list, { search: search || undefined });
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Candidates</h1>
        <Link href="/candidates/new" className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90"><Plus className="h-4 w-4" />Add Candidate</Link>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(candidates ?? []).map((c) => (
              <TableRow key={c._id} className="cursor-pointer" onClick={() => router.push("/candidates/" + c._id)}>
                <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.currentTitle ?? "—"}</TableCell>
                <TableCell><Badge variant="outline">{formatEnum(c.source)}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">{c.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                </TableCell>
              </TableRow>
            ))}
            {(!candidates || candidates.length === 0) && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No candidates found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}