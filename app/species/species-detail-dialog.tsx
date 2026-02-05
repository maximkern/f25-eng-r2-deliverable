"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EditSpeciesDialog from "./edit-species-dialog";
import type { SpeciesWithAuthor } from "./species-card";

export default function SpeciesDetailDialog({ species, userId }: { species: SpeciesWithAuthor; userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").delete().eq("id", species.id);

    if (error) {
      setIsDeleting(false);
      toast({
        title: "Error deleting species",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Close the parent detail dialog
    setOpen(false);

    toast({
      title: "Species deleted",
      description: `${species.scientific_name} has been removed.`,
    });
    router.refresh();
  };

  const isAuthor = species.author === userId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Conservation Status</h4>
              <p className={`text-base font-medium ${species.endangered ? "text-red-600" : "text-green-600"}`}>
                {species.endangered ? "Endangered" : "Not Endangered"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Added by</h4>
              <p className="text-base">{species.profiles?.display_name ?? "Unknown"}</p>
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
          <div className="flex gap-2">
            {isAuthor && <EditSpeciesDialog species={species} />}
            {isAuthor && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Species?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {species.scientific_name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
