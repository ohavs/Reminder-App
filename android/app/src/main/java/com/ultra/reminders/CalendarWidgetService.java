package com.ultra.reminders;

import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/** Produces the 42 day-cells for the calendar widget's month grid. */
public class CalendarWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new CalFactory(getApplicationContext(), intent.getIntExtra("offset", 0));
    }

    static class CalFactory implements RemoteViewsFactory {
        private final Context ctx;
        private final int offset;
        private int year, month, blanks, daysInMonth;
        private int todayY, todayM, todayD;
        private final Set<String> dates = new HashSet<>();

        CalFactory(Context ctx, int offset) { this.ctx = ctx; this.offset = offset; }

        @Override public void onCreate() {}

        @Override
        public void onDataSetChanged() {
            Calendar c = Calendar.getInstance();
            c.set(Calendar.DAY_OF_MONTH, 1);
            c.add(Calendar.MONTH, offset);
            year = c.get(Calendar.YEAR);
            month = c.get(Calendar.MONTH);
            blanks = c.get(Calendar.DAY_OF_WEEK) - 1;   // Sunday(1) → 0 leading blanks
            daysInMonth = c.getActualMaximum(Calendar.DAY_OF_MONTH);

            Calendar t = Calendar.getInstance();
            todayY = t.get(Calendar.YEAR); todayM = t.get(Calendar.MONTH); todayD = t.get(Calendar.DAY_OF_MONTH);

            dates.clear();
            JSONArray rs = WidgetData.getReminders(ctx);
            for (int i = 0; i < rs.length(); i++) {
                JSONObject r = rs.optJSONObject(i);
                if (r == null) continue;
                String dd = r.optString("dueDate", "");
                if (!dd.isEmpty()) dates.add(dd);
            }
        }

        @Override public void onDestroy() { dates.clear(); }
        @Override public int getCount() { return 42; }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews cell = new RemoteViews(ctx.getPackageName(), R.layout.widget_cal_cell);
            int day = position - blanks + 1;
            if (day < 1 || day > daysInMonth) {
                cell.setTextViewText(R.id.cell_day, "");
                cell.setViewVisibility(R.id.cell_dot, View.GONE);
                cell.setViewVisibility(R.id.cell_today_bg, View.GONE);
                return cell;
            }
            cell.setTextViewText(R.id.cell_day, String.valueOf(day));
            String ds = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day);
            boolean isToday = (year == todayY && month == todayM && day == todayD);
            boolean hasRem = dates.contains(ds);

            cell.setViewVisibility(R.id.cell_today_bg, isToday ? View.VISIBLE : View.GONE);
            cell.setTextColor(R.id.cell_day,
                ctx.getColor(isToday ? R.color.widget_today_text : R.color.widget_title));
            cell.setViewVisibility(R.id.cell_dot, hasRem && !isToday ? View.VISIBLE : View.GONE);
            return cell;
        }

        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int position) { return position; }
        @Override public boolean hasStableIds() { return true; }
    }
}
