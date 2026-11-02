import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";

export default async function AccountPage() {
  await requireUser("/account");
  redirect("/profile");
}
