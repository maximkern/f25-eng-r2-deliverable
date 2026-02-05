"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { SpeciesWithAuthor } from "./species-card";
import SpeciesCard from "./species-card";

interface SpeciesSearchProps {
  species: SpeciesWithAuthor[] | null;
  userId: string;
}

export default function SpeciesSearch({ species, userId }: SpeciesSearchProps) {
  const [search, setSearch] = useState("");

  const speciesList = species ?? [];
  const query = search.toLowerCase();

  const filtered = speciesList.filter(
    (s) =>
      s.scientific_name.toLowerCase().includes(query) ||
      (s.common_name?.toLowerCase().includes(query) ?? false) ||
      (s.description?.toLowerCase().includes(query) ?? false),
  );

  return (
    <>
      <Input
        type="text"
        placeholder="Search species..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />
      {filtered.length > 0 ? (
        <div className="flex flex-wrap justify-center">
          {filtered.map((s) => (
            <SpeciesCard key={s.id} species={s} userId={userId} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nothing like that here yet!</p>
      )}
    </>
  );
}
