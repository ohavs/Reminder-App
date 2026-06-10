package com.ultra.reminders;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;

import java.util.Collections;

@CapacitorPlugin(
    name = "Geofence",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location"),
        @Permission(strings = { Manifest.permission.ACCESS_BACKGROUND_LOCATION }, alias = "background")
    }
)
public class GeofencePlugin extends Plugin {

    static final int PENDING_INTENT_REQUEST = 1001;

    private GeofencingClient client;

    @Override
    public void load() {
        client = LocationServices.getGeofencingClient(getContext());
    }

    @PluginMethod
    public void addGeofence(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationCallback");
            return;
        }
        ensureBackground(call);
    }

    @PermissionCallback
    private void locationCallback(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("location permission denied");
            return;
        }
        ensureBackground(call);
    }

    private void ensureBackground(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                && getPermissionState("background") != PermissionState.GRANTED) {
            requestPermissionForAlias("background", call, "backgroundCallback");
            return;
        }
        doAdd(call);
    }

    @PermissionCallback
    private void backgroundCallback(PluginCall call) {
        // Without "allow all the time" the geofence may only fire while the
        // app is in the foreground — register anyway rather than fail.
        doAdd(call);
    }

    @SuppressLint("MissingPermission")
    private void doAdd(PluginCall call) {
        String id = call.getString("id");
        Double lat = call.getDouble("lat");
        Double lng = call.getDouble("lng");
        Double radius = call.getDouble("radius");
        String trigger = call.getString("trigger", "arrive");
        String title = call.getString("title", "תזכורת");
        String body = call.getString("body", "");

        if (id == null || lat == null || lng == null) {
            call.reject("missing id/lat/lng");
            return;
        }
        double r = radius != null ? radius : 200;

        int transition = "leave".equals(trigger)
            ? Geofence.GEOFENCE_TRANSITION_EXIT
            : Geofence.GEOFENCE_TRANSITION_ENTER;

        Geofence fence = new Geofence.Builder()
            .setRequestId(id)
            .setCircularRegion(lat, lng, (float) r)
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(transition)
            .build();

        GeofencingRequest request = new GeofencingRequest.Builder()
            .setInitialTrigger(0)
            .addGeofence(fence)
            .build();

        GeofenceStore.save(getContext(), id, lat, lng, r, trigger, title, body);

        client.addGeofences(request, getPendingIntent())
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> {
                GeofenceStore.remove(getContext(), id);
                call.reject("geofence registration failed: " + e.getMessage());
            });
    }

    @PluginMethod
    public void removeGeofence(PluginCall call) {
        String id = call.getString("id");
        if (id == null) {
            call.reject("missing id");
            return;
        }
        GeofenceStore.remove(getContext(), id);
        client.removeGeofences(Collections.singletonList(id))
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(String.valueOf(e.getMessage())));
    }

    private PendingIntent getPendingIntent() {
        Intent intent = new Intent(getContext(), GeofenceReceiver.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        }
        return PendingIntent.getBroadcast(getContext(), PENDING_INTENT_REQUEST, intent, flags);
    }
}
