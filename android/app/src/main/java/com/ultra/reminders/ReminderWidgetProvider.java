package com.ultra.reminders;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;

/**
 * The home-screen reminder widget. Renders a scrollable list of reminders for
 * the list chosen at configuration time, each with a checkbox that marks the
 * reminder done. Adapts to any size via a single resizable ListView layout.
 */
public class ReminderWidgetProvider extends AppWidgetProvider {

    static final String ACTION_TOGGLE = "com.ultra.reminders.WIDGET_TOGGLE";
    static final String ACTION_REFRESH = "com.ultra.reminders.WIDGET_REFRESH";
    static final String EXTRA_ID = "extra_id";
    static final String EXTRA_LIST = "extra_list";
    static final String EXTRA_DONE = "extra_done";
    static final String EXTRA_TYPE = "extra_type";
    static final String TYPE_TOGGLE = "toggle";
    static final String TYPE_OPEN = "open";

    /** Ask every placed widget to rebuild — used after a JS snapshot sync. */
    static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        ComponentName cn = new ComponentName(ctx, ReminderWidgetProvider.class);
        int[] ids = mgr.getAppWidgetIds(cn);
        for (int id : ids) updateWidget(ctx, mgr, id);
        mgr.notifyAppWidgetViewDataChanged(ids, R.id.widget_list);
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateWidget(ctx, mgr, id);
    }

    @Override
    public void onDeleted(Context ctx, int[] appWidgetIds) {
        for (int id : appWidgetIds) WidgetData.removeWidget(ctx, id);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        String action = intent.getAction();
        if (action == null) return;

        if (ACTION_TOGGLE.equals(action)) {
            String type = intent.getStringExtra(EXTRA_TYPE);
            if (TYPE_OPEN.equals(type)) {
                launchApp(ctx);
                return;
            }
            String id = intent.getStringExtra(EXTRA_ID);
            String listId = intent.getStringExtra(EXTRA_LIST);
            boolean done = intent.getBooleanExtra(EXTRA_DONE, true);
            if (id != null) {
                WidgetData.queueToggle(ctx, id, listId != null ? listId : WidgetData.PERSONAL, done);
                AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
                int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ReminderWidgetProvider.class));
                mgr.notifyAppWidgetViewDataChanged(ids, R.id.widget_list);
                // The tap is flushed to Firestore the next time the app is opened
                // or regains focus (see useWidgetSync); the snapshot is updated
                // optimistically above so the checkbox flips immediately.
            }
        } else if (ACTION_REFRESH.equals(action)) {
            refreshAll(ctx);
        }
    }

    static void updateWidget(Context ctx, AppWidgetManager mgr, int appWidgetId) {
        String listId = WidgetData.getWidgetList(ctx, appWidgetId);
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_reminders);

        views.setTextViewText(R.id.widget_title, WidgetData.listName(ctx, listId));

        // Collection adapter — a fresh intent per widget so each shows its own list
        Intent svc = new Intent(ctx, ReminderWidgetService.class);
        svc.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        svc.putExtra(EXTRA_LIST, listId);
        svc.setData(Uri.parse(svc.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.widget_list, svc);
        views.setEmptyView(R.id.widget_list, R.id.widget_empty);

        // One broadcast template; each row fills in its own extras
        Intent toggle = new Intent(ctx, ReminderWidgetProvider.class);
        toggle.setAction(ACTION_TOGGLE);
        toggle.setData(Uri.parse("ultra://widget/" + appWidgetId));
        PendingIntent template = PendingIntent.getBroadcast(
            ctx, appWidgetId, toggle, pendingFlags(true));
        views.setPendingIntentTemplate(R.id.widget_list, template);

        // Header: open the app
        views.setOnClickPendingIntent(R.id.widget_header, openAppIntent(ctx, appWidgetId));
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshIntent(ctx, appWidgetId));

        mgr.updateAppWidget(appWidgetId, views);
        mgr.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list);
    }

    private static PendingIntent openAppIntent(Context ctx, int appWidgetId) {
        Intent i = new Intent(ctx, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, 2000 + appWidgetId, i, pendingFlags(false));
    }

    private static PendingIntent refreshIntent(Context ctx, int appWidgetId) {
        Intent i = new Intent(ctx, ReminderWidgetProvider.class);
        i.setAction(ACTION_REFRESH);
        i.setData(Uri.parse("ultra://widget/refresh/" + appWidgetId));
        return PendingIntent.getBroadcast(ctx, 3000 + appWidgetId, i, pendingFlags(false));
    }

    private static void launchApp(Context ctx) {
        Intent i = new Intent(ctx, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        ctx.startActivity(i);
    }

    private static int pendingFlags(boolean mutable) {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= mutable ? PendingIntent.FLAG_MUTABLE : PendingIntent.FLAG_IMMUTABLE;
        }
        return flags;
    }
}
