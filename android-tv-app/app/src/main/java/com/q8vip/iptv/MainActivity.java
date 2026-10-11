package com.q8vip.iptv;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {

    private WebView webView;
    private static final String PREF_NAME = "Q8VipIptvPrefs";
    private static final String KEY_SERVER_URL = "server_url";
    
    // الرابط السحابي الدائم للمنصة أونلاين
    private static final String DEFAULT_URL = "https://q8-vip-iptv2.onrender.com/tv";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // إبقاء الشاشة مضاءة أثناء تشغيل البث التلفزيوني
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // وضع الشاشة الكاملة
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
        );

        FrameLayout layout = new FrameLayout(this);
        webView = new WebView(this);
        layout.addView(webView);
        setContentView(layout);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUserAgentString(settings.getUserAgentString() + " Q8VipIptvAndroidTV/1.0");

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });

        SharedPreferences prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        String targetUrl = prefs.getString(KEY_SERVER_URL, DEFAULT_URL);

        webView.loadUrl(targetUrl);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // تمرير أزرار الريموت إلى صفحة الويب
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView.canGoBack()) {
                webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 27}));", null);
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
