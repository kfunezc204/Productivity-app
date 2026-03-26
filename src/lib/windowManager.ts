import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function showFloatingTimer(): Promise<void> {
  try {
    const win = await WebviewWindow.getByLabel("floating-timer");
    if (win) await win.show();
  } catch (e) {
    console.warn("showFloatingTimer failed:", e);
  }
}

export async function hideFloatingTimer(): Promise<void> {
  try {
    const win = await WebviewWindow.getByLabel("floating-timer");
    if (win) await win.hide();
  } catch (e) {
    console.warn("hideFloatingTimer failed:", e);
  }
}

export async function showMainWindow(): Promise<void> {
  try {
    const win = await WebviewWindow.getByLabel("main");
    if (win) {
      await win.show();
      await win.setFocus();
    }
  } catch (e) {
    console.warn("showMainWindow failed:", e);
  }
}

export async function hideMainWindow(): Promise<void> {
  try {
    const win = await WebviewWindow.getByLabel("main");
    if (win) await win.hide();
  } catch (e) {
    console.warn("hideMainWindow failed:", e);
  }
}

export async function minimizeToFloating(): Promise<void> {
  await showFloatingTimer();
  await hideMainWindow();
}

export async function expandToMain(): Promise<void> {
  await showMainWindow();
  await hideFloatingTimer();
}
