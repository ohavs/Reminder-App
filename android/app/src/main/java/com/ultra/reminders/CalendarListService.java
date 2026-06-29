package com.ultra.reminders;

import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

/** Lists the displayed month's dated reminders, below the calendar grid. */
public class CalendarListService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new Factory(getApplicationContext(), intent.getIntExtra("offset", 0));
    }

    static class Factory implements RemoteViewsFactory {
        private final Context ctx;
        private final int offset;
        private final List<JSONObject> items = new ArrayList<>();

        Factory(Context ctx, int offset) { this.ctx = ctx; this.offset = offset; }

        @Override public void onCreate() {}

        @Override
        public void onDataSetChanged() {
            items.clear();
            Calendar c = Calendar.getInstance();
            c.set(Calendar.DAY_OF_MONTH, 1);
            c.add(Calendar.MONTH, offset);
            String prefix = String.format(Locale.US, "%04d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1);

            JSONArray all = WidgetData.getReminders(ctx);
            for (int i = 0; i < all.length(); i++) {
                JSONObject r = all.optJSONObject(i);
                if (r == null) continue;
                String due = r.optString("dueDate", "");
                if (due.startsWith(prefix)) items.add(r);
            }
            Collections.sort(items, (a, b) -> a.optString("dueDate").compareTo(b.optString("dueDate")));
        }

        @Override public void onDestroy() { items.clear(); }
        @Override public int getCount() { return items.size(); }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews row = new RemoteViews(ctx.getPackageName(), R.layout.widget_cal_list_item);
            JSONObject r = items.get(position);
            String due = r.optString("dueDate", "");
            String day = due.length() >= 10 ? due.substring(8, 10) : "";
            row.setTextViewText(R.id.cl_date, day);
            row.setTextViewText(R.id.cl_title, r.optString("title", "תזכורת"));
            row.setOnClickFillInIntent(R.id.cl_title, new Intent());
            return row;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int position) { return position; }
        @Override public boolean hasStableIds() { return true; }
    }
}
