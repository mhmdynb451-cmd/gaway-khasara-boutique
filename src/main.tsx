import "@/lib/dev-error-overlay";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

async function bootstrap() {
  try {
    const router = getRouter();
    const el = document.getElementById("root");
    if (!el) {
      document.body.innerHTML = "<pre style='color:red;padding:16px'>Fatal: #root element not found</pre>";
      return;
    }
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    );
    // Log mount success for debugging in WebView
    // eslint-disable-next-line no-console
    console.info("App mounted");
  } catch (err) {
    try {
      document.body.innerHTML = `<pre style="color:red;padding:16px">Bootstrap error:\n${String(err)}</pre>`;
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line no-console
    console.error("Bootstrap failed", err);
  }
}

bootstrap();
