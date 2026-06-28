package com.ultra.reminders;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Single source of truth shared between the web app (via WidgetBridge) and the
 * home-screen widget. Stores:
 *   • "snapshot"            – { lists:[...], reminders:[...] } pushed from JS
 *   • "list_<appWidgetId>"  – which list each widget instance shows
 *   • "pending"             – checkbox taps awaiting write-back to Firestore
 */
public final class WidgetData {
    private static final String PREFS = "ultra_widget";
    private static final String KEY_SNAPSHOT = "snapshot";
    private static final String KEY_PENDING = "pending";
    private static final String LIST_PREFIX = "list_";
    private static final String CAL_PREFIX = "caloffset_";

    public static final String PERSONAL = "personal";

    private WidgetData() {}

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    // ---- Snapshot ----------------------------------------------------------

    public static void saveSnapshot(Context ctx, JSONArray lists, JSONArray reminders) {
        try {
            JSONObject o = new JSONObject();
            o.put("lists", lists != null ? lists : new JSONArray());
            o.put("reminders", reminders != null ? reminders : new JSONArray());
            prefs(ctx).edit().putString(KEY_SNAPSHOT, o.toString()).apply();
        } catch (JSONException ignored) {
        }
    }

    private static JSONObject snapshot(Context ctx) {
        String raw = prefs(ctx).getString(KEY_SNAPSHOT, null);
        if (raw == null) return new JSONObject();
        try {
            return new JSONObject(raw);
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    public static JSONArray getLists(Context ctx) {
        JSONArray l = snapshot(ctx).optJSONArray("lists");
        return l != null ? l : new JSONArray();
    }

    public static JSONArray getReminders(Context ctx) {
        JSONArray r = snapshot(ctx).optJSONArray("reminders");
        return r != null ? r : new JSONArray();
    }

    /** Reminders belonging to one list, pending first then completed. */
    public static JSONArray remindersForList(Context ctx, String listId) {
        JSONArray all = getReminders(ctx);
        JSONArray pending = new JSONArray();
        JSONArray done = new JSONArray();
        for (int i = 0; i < all.length(); i++) {
            JSONObject r = all.optJSONObject(i);
            if (r == null) continue;
            if (!listId.equals(r.optString("listId"))) continue;
            if (r.optBoolean("done")) done.put(r); else pending.put(r);
        }
        for (int i = 0; i < done.length(); i++) pending.put(done.opt(i));
        return pending;
    }

    public static int openCount(Context ctx, String listId) {
        JSONArray all = getReminders(ctx);
        int n = 0;
        for (int i = 0; i < all.length(); i++) {
            JSONObject r = all.optJSONObject(i);
            if (r != null && listId.equals(r.optString("listId")) && !r.optBoolean("done")) n++;
        }
        return n;
    }

    public static String listName(Context ctx, String listId) {
        JSONArray lists = getLists(ctx);
        for (int i = 0; i < lists.length(); i++) {
            JSONObject l = lists.optJSONObject(i);
            if (l != null && listId.equals(l.optString("id"))) return l.optString("name", listId);
        }
        return "תזכורות";
    }

    // ---- Per-widget list selection ----------------------------------------

    public static void setWidgetList(Context ctx, int appWidgetId, String listId) {
        prefs(ctx).edit().putString(LIST_PREFIX + appWidgetId, listId).apply();
    }

    public static String getWidgetList(Context ctx, int appWidgetId) {
        return prefs(ctx).getString(LIST_PREFIX + appWidgetId, PERSONAL);
    }

    public static void removeWidget(Context ctx, int appWidgetId) {
        prefs(ctx).edit()
            .remove(LIST_PREFIX + appWidgetId)
            .remove(CAL_PREFIX + appWidgetId)
            .apply();
    }

    // ---- Calendar widget: per-widget month offset --------------------------

    public static int getCalOffset(Context ctx, int appWidgetId) {
        return prefs(ctx).getInt(CAL_PREFIX + appWidgetId, 0);
    }

    public static void setCalOffset(Context ctx, int appWidgetId, int offset) {
        prefs(ctx).edit().putInt(CAL_PREFIX + appWidgetId, offset).apply();
    }

    // ---- Pending toggles (write-back queue) -------------------------------

    /** Records a checkbox tap and optimistically flips the snapshot for instant UI. */
    public static void queueToggle(Context ctx, String id, String listId, boolean done) {
        try {
            JSONArray pending = getPendingRaw(ctx);
            // De-dupe: drop any earlier entry for the same reminder
            JSONArray cleaned = new JSONArray();
            for (int i = 0; i < pending.length(); i++) {
                JSONObject p = pending.optJSONObject(i);
                if (p != null && id.equals(p.optString("id"))) continue;
                cleaned.put(pending.opt(i));
            }
            JSONObject t = new JSONObject();
            t.put("id", id);
            t.put("listId", listId);
            t.put("done", done);
            cleaned.put(t);
            prefs(ctx).edit().putString(KEY_PENDING, cleaned.toString()).apply();

            flipDone(ctx, id, done);
        } catch (JSONException ignored) {
        }
    }

    private static void flipDone(Context ctx, String id, boolean done) {
        try {
            JSONObject snap = snapshot(ctx);
            JSONArray reminders = snap.optJSONArray("reminders");
            if (reminders == null) return;
            for (int i = 0; i < reminders.length(); i++) {
                JSONObject r = reminders.optJSONObject(i);
                if (r != null && id.equals(r.optString("id"))) {
                    r.put("done", done);
                    break;
                }
            }
            snap.put("reminders", reminders);
            prefs(ctx).edit().putString(KEY_SNAPSHOT, snap.toString()).apply();
        } catch (JSONException ignored) {
        }
    }

    private static JSONArray getPendingRaw(Context ctx) {
        String raw = prefs(ctx).getString(KEY_PENDING, null);
        if (raw == null) return new JSONArray();
        try {
            return new JSONArray(raw);
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    public static JSONArray getAndClearPending(Context ctx) {
        JSONArray pending = getPendingRaw(ctx);
        prefs(ctx).edit().remove(KEY_PENDING).apply();
        return pending;
    }
}
