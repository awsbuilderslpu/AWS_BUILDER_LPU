import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/server";
import { fetchContactMessagesAction } from "@/lib/messages/actions";
import { MessagesView } from "@/components/features/admin/messages/MessagesView";

export const metadata: Metadata = {
  title: "Contact Messages | Admin Console",
};

export default async function AdminMessagesPage() {
  await connection();
  await requireStaff("/admin/messages");
  const messages = await fetchContactMessagesAction();

  return <MessagesView initialMessages={messages} />;
}

