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

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/** A month-calendar widget that dots the days which have reminders. */
public class CalendarWidgetProvider extends AppWidgetProvider {

    static final String ACTION_PREV = "com.ultra.reminders.CAL_PREV";
    static final String ACTION_NEXT = "com.ultra.reminders.CAL_NEXT";
    static final String ACTION_TODAY = "com.ultra.reminders.CAL_TODAY";
    static final String EXTRA_ID = "extra_id";

    static void refreshAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, CalendarWidgetProvider.class));
        for (int id : ids) updateWidget(ctx, mgr, id);
        if (ids.length > 0) {
            mgr.notifyAppWidgetViewDataChanged(ids, R.id.cal_grid);
            mgr.notifyAppWidgetViewDataChanged(ids, R.id.cal_list);
        }
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) updateWidget(ctx, mgr, id);
    }

    @Override
    public void onDeleted(Context ctx, int[] ids) {
        for (int id : ids) WidgetData.removeWidget(ctx, id);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        String a = intent.getAction();
        if (a == null) return;
        int id = intent.getIntExtra(EXTRA_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (id == AppWidgetManager.INVALID_APPWIDGET_ID) return;

        if (ACTION_PREV.equals(a)) {
            WidgetData.setCalOffset(ctx, id, WidgetData.getCalOffset(ctx, id) - 1);
        } else if (ACTION_NEXT.equals(a)) {
            WidgetData.setCalOffset(ctx, id, WidgetData.getCalOffset(ctx, id) + 1);
        } else if (ACTION_TODAY.equals(a)) {
            WidgetData.setCalOffset(ctx, id, 0);
        } else {
            return;
        }
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        updateWidget(ctx, mgr, id);
        mgr.notifyAppWidgetViewDataChanged(id, R.id.cal_grid);
    }

    static void updateWidget(Context ctx, AppWidgetManager mgr, int appWidgetId) {
        int offset = WidgetData.getCalOffset(ctx, appWidgetId);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_calendar);

        Calendar c = Calendar.getInstance();
        c.set(Calendar.DAY_OF_MONTH, 1);
        c.add(Calendar.MONTH, offset);
        String label = new SimpleDateFormat("MMMM yyyy", new Locale("he")).format(c.getTime());
        v.setTextViewText(R.id.cal_month, label);

        PendingIntent openApp = openAppTemplate(ctx, appWidgetId);

        // Month grid — tapping a day opens the app
        Intent svc = new Intent(ctx, CalendarWidgetService.class);
        svc.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        svc.putExtra("offset", offset);
        svc.setData(Uri.parse(svc.toUri(Intent.URI_INTENT_SCHEME)));
        v.setRemoteAdapter(R.id.cal_grid, svc);
        v.setPendingIntentTemplate(R.id.cal_grid, openApp);

        // Scrollable list of this month's reminders below the grid
        Intent listSvc = new Intent(ctx, CalendarListService.class);
        listSvc.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        listSvc.putExtra("offset", offset);
        listSvc.setData(Uri.parse(listSvc.toUri(Intent.URI_INTENT_SCHEME)));
        v.setRemoteAdapter(R.id.cal_list, listSvc);
        v.setEmptyView(R.id.cal_list, R.id.cal_list_empty);
        v.setPendingIntentTemplate(R.id.cal_list, openApp);

        v.setOnClickPendingIntent(R.id.cal_prev, navIntent(ctx, appWidgetId, ACTION_PREV));
        v.setOnClickPendingIntent(R.id.cal_next, navIntent(ctx, appWidgetId, ACTION_NEXT));
        v.setOnClickPendingIntent(R.id.cal_month, navIntent(ctx, appWidgetId, ACTION_TODAY));

        mgr.updateAppWidget(appWidgetId, v);
        mgr.notifyAppWidgetViewDataChanged(appWidgetId, R.id.cal_grid);
        mgr.notifyAppWidgetViewDataChanged(appWidgetId, R.id.cal_list);
    }

    private static PendingIntent openAppTemplate(Context ctx, int id) {
        Intent i = new Intent(ctx, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags |= PendingIntent.FLAG_MUTABLE;
        return PendingIntent.getActivity(ctx, 7000 + id, i, flags);
    }

    private static PendingIntent navIntent(Context ctx, int id, String action) {
        Intent i = new Intent(ctx, CalendarWidgetProvider.class);
        i.setAction(action);
        i.putExtra(EXTRA_ID, id);
        i.setData(Uri.parse("ultra://calwidget/" + action + "/" + id));
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, (action + id).hashCode(), i, flags);
    }
}
