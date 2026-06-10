package com.ultra.reminders;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Persists registered geofence definitions so they can be re-registered
 * after a device reboot (Android clears all geofences on restart).
 */
public final class GeofenceStore {
    private static final String PREFS = "ultra_geofences";

    private GeofenceStore() {}

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static void save(Context ctx, String id, double lat, double lng, double radius,
                            String trigger, String title, String body) {
        try {
            JSONObject o = new JSONObject();
            o.put("lat", lat);
            o.put("lng", lng);
            o.put("radius", radius);
            o.put("trigger", trigger);
            o.put("title", title);
            o.put("body", body);
            prefs(ctx).edit().putString(id, o.toString()).apply();
        } catch (JSONException ignored) {
        }
    }

    public static void remove(Context ctx, String id) {
        prefs(ctx).edit().remove(id).apply();
    }

    public static JSONObject get(Context ctx, String id) {
        String raw = prefs(ctx).getString(id, null);
        if (raw == null) return null;
        try {
            return new JSONObject(raw);
        } catch (JSONException e) {
            return null;
        }
    }

    public static List<String> ids(Context ctx) {
        return new ArrayList<>(prefs(ctx).getAll().keySet());
    }
}
