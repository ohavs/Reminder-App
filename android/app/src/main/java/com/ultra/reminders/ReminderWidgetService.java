package com.ultra.reminders;

import android.content.Context;
import android.content.Intent;
import android.text.SpannableString;
import android.text.style.StrikethroughSpan;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

/** Supplies the per-row RemoteViews for the widget's reminder ListView. */
public class ReminderWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        String listId = intent.getStringExtra(ReminderWidgetProvider.EXTRA_LIST);
        return new ReminderFactory(getApplicationContext(),
            listId != null ? listId : WidgetData.PERSONAL);
    }

    static class ReminderFactory implements RemoteViewsFactory {
        private final Context ctx;
        private final String listId;
        private JSONArray items = new JSONArray();

        ReminderFactory(Context ctx, String listId) {
            this.ctx = ctx;
            this.listId = listId;
        }

        @Override public void onCreate() {}

        @Override
        public void onDataSetChanged() {
            items = WidgetData.remindersForList(ctx, listId);
        }

        @Override public void onDestroy() { items = new JSONArray(); }

        @Override public int getCount() { return items.length(); }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews row = new RemoteViews(ctx.getPackageName(), R.layout.widget_item);
            JSONObject r = items.optJSONObject(position);
            if (r == null) return row;

            String id = r.optString("id");
            boolean done = r.optBoolean("done");
            String title = r.optString("title", "תזכורת");
            String kind = r.optString("kind", "time");
            String sub = r.optString("sub", "");
            if (sub.isEmpty()) {
                if ("place".equals(kind)) sub = "לפי מיקום";
                else sub = r.optString("time", "");
            }
            boolean urgent = "urgent".equals(r.optString("priority"));

            // RemoteViews can't call setPaintFlags/setAlpha, so render the
            // done state with a strikethrough span + a muted colour instead.
            if (done) {
                SpannableString struck = new SpannableString(title);
                struck.setSpan(new StrikethroughSpan(), 0, struck.length(), 0);
                row.setTextViewText(R.id.item_title, struck);
                row.setTextColor(R.id.item_title, ctx.getColor(R.color.widget_muted));
            } else {
                row.setTextViewText(R.id.item_title, title);
                row.setTextColor(R.id.item_title, ctx.getColor(R.color.widget_title));
            }

            if (sub.isEmpty()) {
                row.setViewVisibility(R.id.item_sub, android.view.View.GONE);
            } else {
                row.setViewVisibility(R.id.item_sub, android.view.View.VISIBLE);
                row.setTextViewText(R.id.item_sub, sub);
            }

            row.setImageViewResource(R.id.item_check,
                done ? R.drawable.ic_widget_checked : R.drawable.ic_widget_unchecked);

            row.setImageViewResource(R.id.item_accent,
                urgent ? R.drawable.widget_accent_urgent
                       : "place".equals(kind) ? R.drawable.widget_accent_place
                                              : R.drawable.widget_accent_time);

            // Checkbox → toggle done
            Intent toggle = new Intent();
            toggle.putExtra(ReminderWidgetProvider.EXTRA_TYPE, ReminderWidgetProvider.TYPE_TOGGLE);
            toggle.putExtra(ReminderWidgetProvider.EXTRA_ID, id);
            toggle.putExtra(ReminderWidgetProvider.EXTRA_LIST, listId);
            toggle.putExtra(ReminderWidgetProvider.EXTRA_DONE, !done);
            row.setOnClickFillInIntent(R.id.item_check, toggle);

            // Row body → open the app
            Intent open = new Intent();
            open.putExtra(ReminderWidgetProvider.EXTRA_TYPE, ReminderWidgetProvider.TYPE_OPEN);
            open.putExtra(ReminderWidgetProvider.EXTRA_ID, id);
            row.setOnClickFillInIntent(R.id.item_body, open);

            return row;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int position) {
            JSONObject r = items.optJSONObject(position);
            return r != null ? r.optString("id", String.valueOf(position)).hashCode() : position;
        }
        @Override public boolean hasStableIds() { return true; }
    }
}
