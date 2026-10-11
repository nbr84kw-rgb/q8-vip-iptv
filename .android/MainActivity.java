package app.q8vip.iptv;
import android.app.Activity; import android.os.Bundle; import android.view.*; import android.webkit.*; import android.widget.FrameLayout;
public class MainActivity extends Activity {
  WebView w; View full; WebChromeClient.CustomViewCallback cb; FrameLayout root;
  protected void onCreate(Bundle b){ super.onCreate(b);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    root=new FrameLayout(this); w=new WebView(this); root.addView(w); setContentView(root);
    WebSettings s=w.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false); s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true); s.setUserAgentString(s.getUserAgentString()+" Q8VIPApp/1.5");
    CookieManager.getInstance().setAcceptThirdPartyCookies(w,true);
    w.setLayerType(View.LAYER_TYPE_HARDWARE,null); w.setFocusable(true); w.setFocusableInTouchMode(true);
    w.setWebViewClient(new WebViewClient(){ public void onReceivedSslError(WebView v, SslErrorHandler h, android.net.http.SslError e){ h.proceed(); }});
    w.setWebChromeClient(new WebChromeClient(){
      public void onShowCustomView(View v, CustomViewCallback c){ full=v; cb=c; root.addView(v,new FrameLayout.LayoutParams(-1,-1)); w.setVisibility(View.GONE); v.requestFocus(); }
      public void onHideCustomView(){ if(full!=null){ root.removeView(full); full=null; } w.setVisibility(View.VISIBLE); w.requestFocus(); if(cb!=null) cb.onCustomViewHidden(); }
    });
    if(b!=null) w.restoreState(b); else w.loadUrl("https://kingly-media-hub.lovable.app/");
    w.requestFocus(); }
  public boolean dispatchKeyEvent(KeyEvent e){
    if(full!=null && e.getKeyCode()!=KeyEvent.KEYCODE_BACK){ return w.dispatchKeyEvent(e); }
    return super.dispatchKeyEvent(e); }
  public void onBackPressed(){
    if(full!=null){ w.evaluateJavascript("document.exitFullscreen&&document.exitFullscreen()",null); return; }
    if(w.canGoBack()) w.goBack(); else finish(); }
  protected void onSaveInstanceState(Bundle o){ super.onSaveInstanceState(o); w.saveState(o); }
}
