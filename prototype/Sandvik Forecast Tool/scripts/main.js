const shellModules = [
  { src: "./pages/login-shell.js", varName: "APP_LOGIN_SHELL_HTML" },
  { src: "./pages/layout-shell.js", varName: "APP_LAYOUT_SHELL_HTML" },
  { src: "./pages/overview-shell.js", varName: "APP_OVERVIEW_SHELL_HTML" },
  { src: "./pages/forecast-shell.js", varName: "APP_FORECAST_SHELL_HTML" },
  { src: "./pages/approval-shell.js", varName: "APP_APPROVAL_SHELL_HTML" },
  { src: "./pages/manage-shell.js", varName: "APP_MANAGE_SHELL_HTML" },
  { src: "./pages/layout-close-shell.js", varName: "APP_LAYOUT_CLOSE_SHELL_HTML" },
  { src: "./pages/dialogs-shell.js", varName: "APP_DIALOGS_SHELL_HTML" }
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`加载脚本失败: ${src}`));
    document.body.appendChild(script);
  });
}

async function loadShellModules() {
  for (const module of shellModules) {
    await loadScript(module.src);
  }
}

function getTemplateText(varName) {
  const rawTemplate = window[varName];
  const htmlTemplate =
    typeof rawTemplate === "string"
      ? rawTemplate
      : rawTemplate && typeof rawTemplate.value === "string"
      ? rawTemplate.value
      : "";
  return htmlTemplate.replace(/^\uFEFF/, "");
}

function renderAppShell() {
  const slot = document.getElementById("app-shell-slot");
  if (!slot) {
    throw new Error("未找到模板容器: app-shell-slot");
  }

  const templateFragments = shellModules.map((module) => {
    const fragment = getTemplateText(module.varName);
    if (!fragment.trim()) {
      throw new Error(`页面模板未加载: ${module.varName}`);
    }
    return fragment;
  });

  if (templateFragments.length === 0) {
    throw new Error("页面模板未加载");
  }

  slot.innerHTML = templateFragments.join("\n");
}

async function bootstrap() {
  try {
    await loadShellModules();
    renderAppShell();
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js");
    } catch (error) {
      console.warn("ECharts CDN 加载失败，将继续尝试启动页面。", error);
    }
    await loadScript("./app.js");
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `
      <div style="padding:24px;font-family:Segoe UI,Arial,sans-serif;color:#b23a3a;">
        页面初始化失败：${error.message}
      </div>
    `;
  }
}

bootstrap();
