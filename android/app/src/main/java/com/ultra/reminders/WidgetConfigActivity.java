package com.ultra.reminders;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Shown when a widget is first placed (and re-openable via "reconfigure").
 * Lets the user choose which list the widget displays.
 */
public class WidgetConfigActivity extends Activity {

    private int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private final List<String> listIds = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Cancel by default — only commit when the user actually picks a list
        setResult(RESULT_CANCELED);
        setContentView(R.layout.widget_config);

        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            appWidgetId = extras.getInt(
                AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        TextView empty = findViewById(R.id.config_empty);
        ListView list = findViewById(R.id.config_list);

        List<String> names = new ArrayList<>();
        JSONArray lists = WidgetData.getLists(this);
        for (int i = 0; i < lists.length(); i++) {
            JSONObject l = lists.optJSONObject(i);
            if (l == null) continue;
            listIds.add(l.optString("id", WidgetData.PERSONAL));
            names.add(l.optString("name", "תזכורות"));
        }

        // Fallback when the app hasn't synced yet — still offer the personal list
        if (listIds.isEmpty()) {
            listIds.add(WidgetData.PERSONAL);
            names.add("התזכורות שלי");
            empty.setVisibility(View.VISIBLE);
        } else {
            empty.setVisibility(View.GONE);
        }

        list.setDivider(null);
        list.setAdapter(new ArrayAdapter<>(
            this, R.layout.widget_config_item, R.id.config_item_text, names));
        list.setOnItemClickListener((AdapterView<?> parent, View v, int pos, long idn) -> commit(listIds.get(pos)));
    }

    private void commit(String listId) {
        WidgetData.setWidgetList(this, appWidgetId, listId);

        AppWidgetManager mgr = AppWidgetManager.getInstance(this);
        ReminderWidgetProvider.updateWidget(this, mgr, appWidgetId);

        Intent result = new Intent();
        result.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        setResult(RESULT_OK, result);
        finish();
    }
}
