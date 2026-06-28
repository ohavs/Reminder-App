package com.ultra.reminders;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

/**
 * Capacitor bridge the web app uses to feed the home-screen widget and to
 * collect checkbox taps that happened inside it.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {

    @PluginMethod
    public void sync(PluginCall call) {
        JSArray lists = call.getArray("lists");
        JSArray reminders = call.getArray("reminders");
        WidgetData.saveSnapshot(getContext(), lists, reminders);
        ReminderWidgetProvider.refreshAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void getPendingToggles(PluginCall call) {
        JSONArray pending = WidgetData.getAndClearPending(getContext());
        JSObject ret = new JSObject();
        ret.put("toggles", pending);
        call.resolve(ret);
    }
}
