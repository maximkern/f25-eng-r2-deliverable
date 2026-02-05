"use client";

import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/schema";
import { useState } from "react";
import UserCard from "./user-card";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UsersGridProps {
  profiles: Profile[] | null;
}

export default function UsersGrid({ profiles }: UsersGridProps) {
  const [search, setSearch] = useState("");

  const profileList = profiles ?? [];
  const query = search.toLowerCase();

  const filtered = profileList.filter(
    (p) =>
      p.display_name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      (p.biography?.toLowerCase().includes(query) ?? false),
  );

  return (
    <>
      <Input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />
      {filtered.length > 0 ? (
        <div className="flex flex-wrap justify-center">
          {filtered.map((p) => (
            <UserCard key={p.id} profile={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No users found.</p>
      )}
    </>
  );
}
