"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/lib/schema";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function getInitials(displayName: string, email: string): string {
  const trimmed = displayName.trim();
  if (trimmed.length === 0) {
    // Fallback to first character of email
    return email.charAt(0).toUpperCase();
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    // Single word: use first two characters
    return trimmed.slice(0, 2).toUpperCase();
  }
  // Multiple words: use first character of first two words
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();
}

export default function UserCard({ profile }: { profile: Profile }) {
  const initials = getInitials(profile.display_name, profile.email);

  return (
    <div className="m-4 flex w-72 min-w-72 flex-col rounded border-2 p-4 shadow">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{profile.display_name}</h3>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>
      {profile.biography ? (
        <p className="mt-3 text-sm">{profile.biography}</p>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground">No biography provided</p>
      )}
    </div>
  );
}
