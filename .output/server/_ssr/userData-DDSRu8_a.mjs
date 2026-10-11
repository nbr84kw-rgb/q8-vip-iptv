import { t as supabase } from "./client-DgwLyTNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/userData-DDSRu8_a.mjs
async function listFavorites() {
	const { data, error } = await supabase.from("favorites").select("id, item_id, item_type, name, icon, stream_url").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function toggleFavorite(item) {
	const { data: user } = await supabase.auth.getUser();
	const uid = user.user?.id;
	if (!uid) throw new Error("NOT_AUTHENTICATED");
	const { data: existing } = await supabase.from("favorites").select("id").eq("item_id", item.itemId).eq("item_type", item.itemType).maybeSingle();
	if (existing) {
		await supabase.from("favorites").delete().eq("id", existing.id);
		return false;
	}
	await supabase.from("favorites").insert({
		user_id: uid,
		item_id: item.itemId,
		item_type: item.itemType,
		name: item.name,
		icon: item.icon ?? null
	});
	return true;
}
async function listHistory(limit = 20) {
	const { data, error } = await supabase.from("watch_history").select("id, item_id, item_type, name, icon, position_seconds, watched_at").order("watched_at", { ascending: false }).limit(limit);
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function clearHistory() {
	const { data: user } = await supabase.auth.getUser();
	const uid = user.user?.id;
	if (!uid) return;
	const { error } = await supabase.from("watch_history").delete().eq("user_id", uid);
	if (error) throw new Error(error.message);
}
async function recordWatch(item) {
	const { data: user } = await supabase.auth.getUser();
	const uid = user.user?.id;
	if (!uid) return;
	await supabase.from("watch_history").upsert({
		user_id: uid,
		item_id: item.itemId,
		item_type: item.itemType,
		name: item.name,
		icon: item.icon ?? null,
		position_seconds: Math.round(item.position ?? 0),
		watched_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id,item_id,item_type" });
}
async function updateProfileSettings(patch) {
	const { data: user } = await supabase.auth.getUser();
	const uid = user.user?.id;
	if (!uid) return;
	await supabase.from("profiles").update(patch).eq("id", uid);
}
//#endregion
export { toggleFavorite as a, recordWatch as i, listFavorites as n, updateProfileSettings as o, listHistory as r, clearHistory as t };
