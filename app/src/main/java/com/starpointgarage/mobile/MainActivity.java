package com.starpointgarage.mobile;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final int CAMERA_REQUEST = 405;
    private static final int PAYMENT_IMAGE_REQUEST = 406;
    private static final long START_SCREEN_DURATION_MS = 1_500L;
    private static final String TRUSTED_HOST = "msvdxyicostwztisvbvl.supabase.co";
    private WebView webView;
    private FrameLayout startScreen;
    private PermissionRequest pendingCameraRequest;
    private ValueCallback<Uri[]> pendingPaymentFileChooser;
    private final Handler uiHandler = new Handler(Looper.getMainLooper());
    private final ExecutorService networkExecutor = Executors.newSingleThreadExecutor();
    private volatile boolean destroyed;
    private volatile boolean loadingDocument;

    // Owner/Technician already call BarcodeDetector.detect(canvas) in their live pages.
    // Android WebView may omit that web API; the fallback only supplies a decoder.
    private static final String SCANNER_FALLBACK = "(function(){"
            + "if(window.BarcodeDetector||!window.StarpointScanner)return;"
            + "var next=0,pending=Object.create(null);"
            + "window.__starpointScannerDone=function(id,value){var p=pending[id];"
            + "if(!p)return;delete pending[id];clearTimeout(p.timer);"
            + "p.resolve(value?[{rawValue:value}]:[]);};"
            + "window.BarcodeDetector=class{constructor(options){}"
            + "static getSupportedFormats(){return Promise.resolve(['qr_code']);}"
            + "detect(canvas){if(!canvas||!canvas.width||!canvas.height)return Promise.resolve([]);"
            + "var max=Math.max(canvas.width,canvas.height),scale=Math.min(1,640/max);"
            + "var small=document.createElement('canvas');"
            + "small.width=Math.max(1,Math.round(canvas.width*scale));"
            + "small.height=Math.max(1,Math.round(canvas.height*scale));"
            + "small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);"
            + "var data=small.toDataURL('image/jpeg',.78),id=++next;"
            + "return new Promise(function(resolve){var timer=setTimeout(function(){"
            + "delete pending[id];resolve([]);},1800);"
            + "pending[id]={resolve:resolve,timer:timer};"
            + "try{window.StarpointScanner.decodeFrame(data,id);}" 
            + "catch(e){clearTimeout(timer);delete pending[id];resolve([]);}});}};"
            + "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        int barColor = BuildConfig.APP_URL.contains("member-app")
                ? Color.rgb(17, 18, 20) : Color.rgb(5, 5, 5);
        getWindow().setStatusBarColor(barColor);
        getWindow().setNavigationBarColor(barColor);
        FrameLayout root = new FrameLayout(this);
        WebView.setWebContentsDebuggingEnabled(false);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        startScreen = new FrameLayout(this);
        startScreen.setBackgroundColor(Color.BLACK);
        ImageView startLogo = new ImageView(this);
        startLogo.setImageResource(com.starpointgarage.mobile.R.drawable.starpoint_logo);
        startLogo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        int logoSize = Math.round(280 * getResources().getDisplayMetrics().density);
        FrameLayout.LayoutParams logoLayout = new FrameLayout.LayoutParams(logoSize, logoSize);
        logoLayout.gravity = Gravity.CENTER;
        startScreen.addView(startLogo, logoLayout);
        root.addView(startScreen, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        if (savedInstanceState == null) {
            uiHandler.postDelayed(() -> {
                if (!destroyed && startScreen != null) startScreen.setVisibility(View.GONE);
            }, START_SCREEN_DURATION_MS);
        } else {
            // Rotation/process restoration must not repeat the 1.5s splash.
            startScreen.setVisibility(View.GONE);
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Allow the URI selected explicitly by the user, not arbitrary file access.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setGeolocationEnabled(false);
        settings.setSaveFormData(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }
        webView.setBackgroundColor(barColor);
        webView.clearCache(true);

        // Existing Member bridge names and methods remain available.
        webView.addJavascriptInterface(new NativeBridge(), "StarpointNative");
        if (!BuildConfig.APP_URL.contains("member-app")) {
            webView.addJavascriptInterface(new ScannerBridge(), "StarpointScanner");
        }
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (destroyed || !trusted(Uri.parse(view.getUrl()))) {
                    callback.onReceiveValue(null);
                    return true;
                }
                if (pendingPaymentFileChooser != null) pendingPaymentFileChooser.onReceiveValue(null);
                pendingPaymentFileChooser = callback;
                try {
                    Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                    pick.addCategory(Intent.CATEGORY_OPENABLE);
                    pick.setType("image/*");
                    pick.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/jpeg", "image/png", "image/webp"});
                    // Allow the Android photo provider to grant read access to WebView.
                    pick.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivityForResult(Intent.createChooser(pick, "Pilih Foto Bukti Pembayaran"), PAYMENT_IMAGE_REQUEST);
                } catch (Exception ex) {
                    pendingPaymentFileChooser = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "Galeri tidak dapat dibuka", Toast.LENGTH_LONG).show();
                }
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleCameraRequest(request));
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (pendingCameraRequest == request) pendingCameraRequest = null;
                });
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (!destroyed && trusted(Uri.parse(url)) && !BuildConfig.APP_URL.contains("member-app")) {
                    view.evaluateJavascript(SCANNER_FALLBACK, null);
                }
            }
        });

        if (savedInstanceState == null) loadLiveApp();
        else webView.restoreState(savedInstanceState);
    }

    private static boolean trusted(Uri uri) {
        return uri != null && "https".equalsIgnoreCase(uri.getScheme())
                && TRUSTED_HOST.equalsIgnoreCase(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    private static boolean appDocument(Uri uri) {
        if (!trusted(uri)) return false;
        String appPath = Uri.parse(BuildConfig.APP_URL).getPath();
        String requestPath = uri.getPath();
        if (appPath == null || requestPath == null) return false;
        if (appPath.equals(requestPath)) return true;
        return appPath.endsWith("/") && appPath.substring(0, appPath.length() - 1).equals(requestPath);
    }

    // Supabase Edge Functions rewrite HTML responses to text/plain. Download the trusted
    // document as text first, then load those exact bytes into WebView as HTML.
    private void loadLiveApp() {
        if (destroyed || loadingDocument) return;
        loadingDocument = true;
        networkExecutor.execute(() -> {
            String html = null;
            for (int attempt = 0; attempt < 3 && html == null && !destroyed; attempt++) {
                html = fetchAppHtml();
                if (html == null && attempt < 2) {
                    try { Thread.sleep(600L); }
                    catch (InterruptedException e) { Thread.currentThread().interrupt(); break; }
                }
            }
            final String document = html;
            runOnUiThread(() -> {
                loadingDocument = false;
                if (destroyed || webView == null) return;
                if (document == null) {
                    Toast.makeText(this, "Aplikasi gagal dimuat. Periksa koneksi lalu buka kembali.", Toast.LENGTH_LONG).show();
                    return;
                }
                webView.loadDataWithBaseURL(BuildConfig.APP_URL, document,
                        "text/html", "UTF-8", BuildConfig.APP_URL);
            });
        });
    }

    private static String fetchAppHtml() {
        HttpURLConnection connection = null;
        try {
            String separator = BuildConfig.APP_URL.contains("?") ? "&" : "?";
            URL url = new URL(BuildConfig.APP_URL + separator + "apk=103&t=" + System.currentTimeMillis());
            connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(15_000);
            connection.setReadTimeout(25_000);
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "text/html,application/xhtml+xml");
            connection.setRequestProperty("Accept-Encoding", "identity");
            connection.setRequestProperty("Cache-Control", "no-cache");
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) return null;
            int announcedSize = connection.getContentLength();
            if (announcedSize > 8_000_000) return null;
            try (InputStream input = connection.getInputStream();
                 ByteArrayOutputStream output = new ByteArrayOutputStream(Math.max(announcedSize, 32_768))) {
                byte[] buffer = new byte[16_384];
                int count, total = 0;
                while ((count = input.read(buffer)) != -1) {
                    total += count;
                    if (total > 8_000_000) return null;
                    output.write(buffer, 0, count);
                }
                String html = new String(output.toByteArray(), StandardCharsets.UTF_8);
                String start = html.trim().toLowerCase(Locale.ROOT);
                return start.startsWith("<!doctype html") || start.startsWith("<html") ? html : null;
            }
        } catch (Exception ignored) {
            return null;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private void handleCameraRequest(PermissionRequest request) {
        if (destroyed || !trusted(request.getOrigin())) {
            request.deny();
            return;
        }
        String[] resources = request.getResources();
        if (resources.length != 1 || !PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resources[0])) {
            request.deny();
            return;
        }
        if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        } else {
            if (pendingCameraRequest != null) pendingCameraRequest.deny();
            pendingCameraRequest = request;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_REQUEST);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != CAMERA_REQUEST || pendingCameraRequest == null) return;
        PermissionRequest request = pendingCameraRequest;
        pendingCameraRequest = null;
        if (!destroyed && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        } else request.deny();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != PAYMENT_IMAGE_REQUEST) return;
        ValueCallback<Uri[]> callback = pendingPaymentFileChooser;
        pendingPaymentFileChooser = null;
        if (callback == null) return;
        Uri[] selected = null;
        if (resultCode == Activity.RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null && "content".equalsIgnoreCase(uri.getScheme())) {
                selected = new Uri[]{uri};
            } else if (data.getClipData() != null && data.getClipData().getItemCount() > 0) {
                Uri clipUri = data.getClipData().getItemAt(0).getUri();
                if (clipUri != null && "content".equalsIgnoreCase(clipUri.getScheme())) selected = new Uri[]{clipUri};
            }
        }
        callback.onReceiveValue(selected);
    }

    private boolean handleUrl(Uri uri) {
        if (uri == null) return false;
        if (appDocument(uri)) {
            loadLiveApp();
            return true;
        }
        String scheme = lower(uri.getScheme()), host = lower(uri.getHost());
        if ("whatsapp".equals(scheme) || "wa.me".equals(host)
                || "api.whatsapp.com".equals(host) || "web.whatsapp.com".equals(host)) {
            String phone = query(uri, "phone"), message = query(uri, "text");
            if ((phone == null || phone.isEmpty()) && "wa.me".equals(host)) {
                String path = uri.getPath();
                if (path != null) phone = path.replace("/", "");
            }
            openWhatsApp(phone, message);
            return true;
        }
        if ("geo".equals(scheme) || "maps.google.com".equals(host)
                || ("www.google.com".equals(host) && uri.getPath() != null
                && uri.getPath().startsWith("/maps"))) {
            String q = query(uri, "query");
            if (q == null || q.isEmpty()) q = query(uri, "q");
            openMaps(q == null || q.isEmpty() ? uri.toString() : q);
            return true;
        }
        if ("http".equals(scheme) || "https".equals(scheme)) {
            if (trusted(uri)) return false;
            launch(new Intent(Intent.ACTION_VIEW, uri));
            return true;
        }
        if ("tel".equals(scheme) || "mailto".equals(scheme)) {
            launch(new Intent(Intent.ACTION_VIEW, uri));
            return true;
        }
        return false;
    }

    private void launch(Intent intent) {
        try { startActivity(intent); }
        catch (Exception e) { Toast.makeText(this, "Aplikasi tujuan tidak tersedia.", Toast.LENGTH_SHORT).show(); }
    }

    public void openWhatsApp(String rawPhone, String rawText) {
        String phone = rawPhone == null ? "" : rawPhone.replaceAll("[^0-9+]", "");
        if (phone.startsWith("+")) phone = phone.substring(1);
        if (phone.startsWith("0")) phone = "62" + phone.substring(1);
        phone = phone.replaceAll("[^0-9]", "");
        if (phone.isEmpty()) phone = "6281345115758";
        String message = rawText == null || rawText.trim().isEmpty()
                ? "Halo Starpoint Garage, saya ingin bertanya." : rawText.trim();
        Uri direct = Uri.parse("whatsapp://send?phone=" + Uri.encode(phone) + "&text=" + Uri.encode(message));
        if (launchPackage(direct, "com.whatsapp") || launchPackage(direct, "com.whatsapp.w4b")) return;
        launch(new Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/" + phone + "?text=" + Uri.encode(message))));
    }

    public void openMaps(String rawQuery) {
        String q = rawQuery == null || rawQuery.trim().isEmpty()
                ? "Starpoint Garage, Jl. Raya Kendangsari Industri No. 58B, Surabaya" : rawQuery.trim();
        if (launchPackage(Uri.parse("geo:0,0?q=" + Uri.encode(q)), "com.google.android.apps.maps")) return;
        launch(new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=" + Uri.encode(q))));
    }

    private boolean launchPackage(Uri uri, String pkg) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.setPackage(pkg);
            startActivity(intent);
            return true;
        } catch (ActivityNotFoundException e) { return false; }
    }

    private static String query(Uri uri, String key) {
        try {
            String value = uri.getQueryParameter(key);
            return value == null ? null : URLDecoder.decode(value, StandardCharsets.UTF_8.name());
        } catch (Exception e) { return null; }
    }

    private static String lower(String value) { return value == null ? "" : value.toLowerCase(Locale.ROOT); }

    public final class NativeBridge {
        @JavascriptInterface public void openWhatsApp(String phone, String text) {
            runOnUiThread(() -> MainActivity.this.openWhatsApp(phone, text));
        }
        @JavascriptInterface public void openMaps(String query) {
            runOnUiThread(() -> MainActivity.this.openMaps(query));
        }
    }

    public final class ScannerBridge {
        @JavascriptInterface public void decodeFrame(String dataUrl, int id) {
            if (destroyed || dataUrl == null || !dataUrl.startsWith("data:image/jpeg;base64,")
                    || dataUrl.length() > 2_000_000 || id < 1) return;
            String value = null;
            try {
                byte[] jpeg = Base64.decode(dataUrl.substring("data:image/jpeg;base64,".length()), Base64.DEFAULT);
                Bitmap bitmap = BitmapFactory.decodeByteArray(jpeg, 0, jpeg.length);
                if (bitmap != null) {
                    int width = bitmap.getWidth(), height = bitmap.getHeight();
                    if (width > 0 && height > 0 && width * (long) height <= 1_000_000) {
                        int[] pixels = new int[width * height];
                        bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
                        RGBLuminanceSource source = new RGBLuminanceSource(width, height, pixels);
                        BinaryBitmap image = new BinaryBitmap(new HybridBinarizer(source));
                        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
                        hints.put(DecodeHintType.POSSIBLE_FORMATS, Collections.singletonList(BarcodeFormat.QR_CODE));
                        Result result = new MultiFormatReader().decode(image, hints);
                        value = result.getText();
                    }
                    bitmap.recycle();
                }
            } catch (Exception ignored) { /* A frame often does not contain a readable QR. */ }
            final String response = value;
            runOnUiThread(() -> {
                if (destroyed || webView == null || !trusted(Uri.parse(webView.getUrl()))) return;
                webView.evaluateJavascript("window.__starpointScannerDone&&window.__starpointScannerDone("
                        + id + "," + (response == null ? "null" : JSONObject.quote(response)) + ")", null);
            });
        }
    }

    // Never reload on Activity resume: preserve WebView DOM, navigation, auth and drafts.
    // A fresh HTML version is fetched only on an actual new launch or explicit navigation.

    @Override public void onConfigurationChanged(android.content.res.Configuration configuration) {
        super.onConfigurationChanged(configuration);
        // Resize the existing WebView instead of destroying and rebuilding it.
        if (webView != null) webView.invalidate();
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override protected void onDestroy() {
        destroyed = true;
        uiHandler.removeCallbacksAndMessages(null);
        startScreen = null;
        networkExecutor.shutdownNow();
        if (pendingPaymentFileChooser != null) {pendingPaymentFileChooser.onReceiveValue(null); pendingPaymentFileChooser = null;}
        if (pendingCameraRequest != null) pendingCameraRequest.deny();
        pendingCameraRequest = null;
        if (webView != null) {
            webView.removeJavascriptInterface("StarpointNative");
            webView.removeJavascriptInterface("StarpointScanner");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
