package com.ultra.reminders;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** Android drops all geofences on reboot — re-register the persisted ones. */
public class BootReceiver extends BroadcastReceiver {

    @SuppressLint("MissingPermission")
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;

        List<Geofence> fences = new ArrayList<>();
        for (String id : GeofenceStore.ids(context)) {
            JSONObject d = GeofenceStore.get(context, id);
            if (d == null) continue;
            int transition = "leave".equals(d.optString("trigger"))
                ? Geofence.GEOFENCE_TRANSITION_EXIT
                : Geofence.GEOFENCE_TRANSITION_ENTER;
            fences.add(new Geofence.Builder()
                .setRequestId(id)
                .setCircularRegion(d.optDouble("lat"), d.optDouble("lng"),
                    (float) d.optDouble("radius", 200))
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(transition)
                .build());
        }
        if (fences.isEmpty()) return;

        GeofencingClient client = LocationServices.getGeofencingClient(context);
        Intent fi = new Intent(context, GeofenceReceiver.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        }
        PendingIntent pi = PendingIntent.getBroadcast(
            context, GeofencePlugin.PENDING_INTENT_REQUEST, fi, flags);
        try {
            client.addGeofences(
                new GeofencingRequest.Builder().setInitialTrigger(0).addGeofences(fences).build(),
                pi);
        } catch (SecurityException ignored) {
            // Location permission was revoked since the geofences were saved.
        }
    }
}
