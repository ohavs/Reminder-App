package com.ultra.reminders;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;

import org.json.JSONObject;

import java.util.List;

/** Posts a notification when a registered geofence is entered / exited. */
public class GeofenceReceiver extends BroadcastReceiver {
    static final String CHANNEL_ID = "reminders";

    @Override
    public void onReceive(Context context, Intent intent) {
        GeofencingEvent event = GeofencingEvent.fromIntent(intent);
        if (event == null || event.hasError()) return;
        List<Geofence> fences = event.getTriggeringGeofences();
        if (fences == null) return;

        NotificationManager nm =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(new NotificationChannel(
                CHANNEL_ID, "תזכורות", NotificationManager.IMPORTANCE_HIGH));
        }

        for (Geofence fence : fences) {
            String id = fence.getRequestId();
            JSONObject data = GeofenceStore.get(context, id);
            String title = data != null ? data.optString("title", "תזכורת") : "תזכורת";
            String body = data != null ? data.optString("body", "") : "";

            Intent open = context.getPackageManager()
                .getLaunchIntentForPackage(context.getPackageName());
            PendingIntent tap = open == null ? null : PendingIntent.getActivity(
                context, id.hashCode(), open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            Notification n = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(context.getApplicationInfo().icon)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setContentIntent(tap)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();
            nm.notify(id.hashCode(), n);
        }
    }
}
