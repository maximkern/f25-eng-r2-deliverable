"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import EditSpeciesDialog from "./edit-species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDetailDialog({ species, userId }: { species: Species; userId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-auto w-full pt-3">Learn More</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{species.scientific_name}</DialogTitle>
          {species.common_name && (
            <p className="text-lg font-light italic text-muted-foreground">{species.common_name}</p>
          )}
        </DialogHeader>

        {species.image && (
          <div className="relative h-60 w-full overflow-hidden rounded-md">
            <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Kingdom</h4>
              <p className="text-base">{species.kingdom}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Total Population</h4>
              <p className="text-base">{species.total_population?.toLocaleString() ?? "Unknown"}</p>
            </div>
          </div>

          {species.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-base leading-relaxed">{species.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <div>{species.author === userId && <EditSpeciesDialog species={species} />}</div>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
