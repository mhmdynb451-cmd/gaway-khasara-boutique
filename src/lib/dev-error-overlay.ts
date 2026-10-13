// src/lib/dev-error-overlay.ts
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function installDevErrorOverlay() {
  function showOverlay(title: string, main: string, detail?: string) {
    try {
      const existing = document.getElementById("error-overlay");
      const errorDiv = existing ?? document.createElement("div");
      errorDiv.id = "error-overlay";
      errorDiv.setAttribute("style", "position:fixed;top:0;left:0;width:100%;height:100%;background:#b91c1c;color:white;padding:18px;z-index:999999;overflow:auto;font-family:monospace;font-size:14px;line-height:1.3;");
      
      const titleHtml = `<h3 style="margin:0 0 8px 0;font-size:18px;">🚨 ${escapeHtml(title)}</h3>`;
      const mainHtml = `<div style="margin-bottom:12px;">${escapeHtml(main)}</div>`;
      const detailHtml = detail ? `<pre style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.15);padding:8px;border-radius:4px;">${escapeHtml(detail)}</pre>` : "";

      errorDiv.innerHTML = titleHtml + mainHtml + detailHtml;
      if (!existing) document.body.appendChild(errorDiv);
    } catch (e) {
      console.error("Failed to show dev error overlay", e);
    }
  }

  window.addEventListener("error", (event) => {
    const message = event.message ?? "Unknown error";
    const stack = (event.error && event.error.stack) || "No stack trace";
    showOverlay("App Runtime Error", message, stack);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason ?? "Unknown rejection";
    const detail = typeof reason === "string" ? reason : (reason && (reason.stack || JSON.stringify(reason))) || String(reason);
    showOverlay("Unhandled Promise Rejection", String(reason), detail);
  });
}

installDevErrorOverlay();
  
