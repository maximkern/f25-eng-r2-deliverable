import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import UsersGrid from "./users-grid";

export default async function UsersPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, biography")
    .order("display_name", { ascending: true });

  return (
    <>
      <TypographyH2>Users</TypographyH2>
      <Separator className="my-4" />
      {error ? (
        <p className="text-destructive">Failed to load users. Please try again later.</p>
      ) : (
        <UsersGrid profiles={profiles} />
      )}
    </>
  );
}
