import { supabase } from "@/integrations/supabase/client";

export type FavRow = {
  id: string;
  item_id: string;
  item_type: string;
  name: string;
  icon: string | null;
  stream_url: string | null;
};

export async function listFavorites() {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, item_id, item_type, name, icon, stream_url")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FavRow[];
}

export async function toggleFavorite(item: { itemId: string; itemType: string; name: string; icon?: string | null }) {
  const { data: user } = await supabase.auth.getUser();
  const uid = user.user?.id;
  if (!uid) throw new Error("NOT_AUTHENTICATED");
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("item_id", item.itemId)
    .eq("item_type", item.itemType)
    .maybeSingle();
  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("favorites").insert({
    user_id: uid,
    item_id: item.itemId,
    item_type: item.itemType,
    name: item.name,
    icon: item.icon ?? null,
  });
  return true;
}

export async function listHistory(limit = 20) {
  const { data, error } = await supabase
    .from("watch_history")
    .select("id, item_id, item_type, name, icon, position_seconds, watched_at")
    .order("watched_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function clearHistory() {
  const { data: user } = await supabase.auth.getUser();
  const uid = user.user?.id;
  if (!uid) return;
  const { error } = await supabase.from("watch_history").delete().eq("user_id", uid);
  if (error) throw new Error(error.message);
}

export async function recordWatch(item: { itemId: string; itemType: string; name: string; icon?: string | null; position?: number }) {
  const { data: user } = await supabase.auth.getUser();
  const uid = user.user?.id;
  if (!uid) return;
  await supabase.from("watch_history").upsert(
    {
      user_id: uid,
      item_id: item.itemId,
      item_type: item.itemType,
      name: item.name,
      icon: item.icon ?? null,
      position_seconds: Math.round(item.position ?? 0),
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_id,item_type" },
  );
}

export async function updateProfileSettings(patch: { language?: string; preferred_quality?: string; display_name?: string }) {
  const { data: user } = await supabase.auth.getUser();
  const uid = user.user?.id;
  if (!uid) return;
  await supabase.from("profiles").update(patch).eq("id", uid);
}
