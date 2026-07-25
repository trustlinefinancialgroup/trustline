import { getDict } from "@/i18n/server";
import { ChatWidget } from "./chat-widget";

export async function ChatLauncher({ prefill }: { prefill?: { name?: string; email?: string } }) {
  const t = await getDict();
  return <ChatWidget labels={t.chat} prefill={prefill} />;
}
