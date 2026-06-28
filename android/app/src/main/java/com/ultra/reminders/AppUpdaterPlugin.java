package com.ultra.reminders;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * In-app updater for the side-loaded APK. The web layer is served over-the-air
 * from Hosting, so only native changes ship a new APK; this checks a small JSON
 * manifest on the GitHub "latest" release and installs the APK on demand.
 */
@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    @PluginMethod
    public void getInfo(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("versionCode", currentVersionCode());
        ret.put("versionName", currentVersionName());
        call.resolve(ret);
    }

    @PluginMethod
    public void checkForUpdate(PluginCall call) {
        final String manifestUrl = call.getString("manifestUrl");
        if (manifestUrl == null) { call.reject("missing manifestUrl"); return; }
        new Thread(() -> {
            try {
                long current = currentVersionCode();
                JSONObject o = new JSONObject(httpGet(manifestUrl));
                long latest = o.optLong("versionCode", 0);
                JSObject ret = new JSObject();
                ret.put("available", latest > current);
                ret.put("currentVersionCode", current);
                ret.put("versionCode", latest);
                ret.put("versionName", o.optString("versionName", ""));
                ret.put("url", o.optString("url", ""));
                ret.put("notes", o.optString("notes", ""));
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("check failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        final String url = call.getString("url");
        if (url == null || url.isEmpty()) { call.reject("missing url"); return; }
        new Thread(() -> {
            try {
                File apk = downloadApk(url);
                installApk(apk);
                call.resolve();
            } catch (Exception e) {
                call.reject("update failed: " + e.getMessage());
            }
        }).start();
    }

    // ---- helpers -----------------------------------------------------------

    private long currentVersionCode() {
        try {
            PackageInfo pi = getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0);
            return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
                ? pi.getLongVersionCode()
                : pi.versionCode;
        } catch (Exception e) {
            return 0;
        }
    }

    private String currentVersionName() {
        try {
            return getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "";
        }
    }

    private String httpGet(String urlStr) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(15000);
        try (InputStream in = conn.getInputStream()) {
            StringBuilder sb = new StringBuilder();
            byte[] buf = new byte[4096];
            int n;
            while ((n = in.read(buf)) != -1) sb.append(new String(buf, 0, n, "UTF-8"));
            return sb.toString();
        } finally {
            conn.disconnect();
        }
    }

    private File downloadApk(String urlStr) throws Exception {
        File dir = new File(getContext().getCacheDir(), "updates");
        if (!dir.exists()) dir.mkdirs();
        File out = new File(dir, "update.apk");
        if (out.exists()) out.delete();

        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(20000);
        conn.setReadTimeout(60000);
        try (InputStream in = conn.getInputStream(); OutputStream fos = new FileOutputStream(out)) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) fos.write(buf, 0, n);
            fos.flush();
        } finally {
            conn.disconnect();
        }
        return out;
    }

    private void installApk(File file) {
        Uri uri = FileProvider.getUriForFile(
            getContext(), getContext().getPackageName() + ".fileprovider", file);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        getContext().startActivity(intent);
    }
}
