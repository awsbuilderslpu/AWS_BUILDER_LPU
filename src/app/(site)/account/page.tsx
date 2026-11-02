import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";

export const instant = false;

export default async function AccountPage() {
  await requireUser("/account");
  redirect("/profile");
}
