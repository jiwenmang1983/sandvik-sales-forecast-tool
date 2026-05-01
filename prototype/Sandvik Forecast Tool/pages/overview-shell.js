window.APP_OVERVIEW_SHELL_HTML = `
<section id="overview-hero" class="hero-card">
  <h2 id="module-title">欢迎使用 Sandvik Forecast Tool</h2>
  <p id="module-desc">当前为高保真交互原型，已搭建系统总框架、角色入口与功能菜单。</p>
  <div class="hero-actions">
    <button class="primary" id="simulate-flow-btn">模拟业务流程</button>
    <button class="secondary" id="open-detail-btn">查看模块说明</button>
  </div>
</section>

<section id="system-workbench" class="forecast-workbench hidden">
  <div class="system-header">
    <div>
      <h3 id="system-title">系统管理</h3>
      <p id="system-desc" class="system-desc">-</p>
    </div>
    <div id="system-actions" class="system-actions"></div>
  </div>

  <section id="user-mgmt-page" class="system-page hidden">
    <div class="system-filters">
      <label>关键词
        <input id="user-keyword" type="text" placeholder="姓名/账号/域" />
      </label>
      <label>角色
        <select id="user-role-filter"></select>
      </label>
      <label>状态
        <select id="user-status-filter">
          <option value="all">全部</option>
          <option value="enabled">启用</option>
          <option value="disabled">停用</option>
        </select>
      </label>
      <div class="system-filter-actions">
        <button id="user-add-btn" class="primary" type="button">新增用户</button>
        <button id="user-refresh-btn" class="ghost-btn" type="button">刷新</button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="forecast-table">
        <thead id="user-table-head"></thead>
        <tbody id="user-table-body"></tbody>
      </table>
    </div>
  </section>

  <section id="role-permission-page" class="system-page hidden">
    <div class="system-filters">
      <label>角色
        <select id="permission-role-select"></select>
      </label>
      <div class="system-filter-actions">
        <button id="permission-save-btn" class="primary" type="button">保存权限</button>
        <button id="permission-reset-btn" class="ghost-btn" type="button">恢复默认</button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="forecast-table">
        <thead id="permission-table-head"></thead>
        <tbody id="permission-table-body"></tbody>
      </table>
    </div>
  </section>

  <section id="login-log-page" class="system-page hidden">
    <div class="system-filters">
      <label>用户
        <input id="login-log-user" type="text" placeholder="姓名/账号" />
      </label>
      <label>结果
        <select id="login-log-result">
          <option value="all">全部</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
        </select>
      </label>
      <label>开始日期
        <input id="login-log-date-start" type="date" />
      </label>
      <label>结束日期
        <input id="login-log-date-end" type="date" />
      </label>
      <div class="system-filter-actions">
        <button id="login-log-export-btn" class="secondary" type="button">导出CSV</button>
        <button id="login-log-clear-btn" class="ghost-btn" type="button">清空</button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="forecast-table">
        <thead id="login-log-head"></thead>
        <tbody id="login-log-body"></tbody>
      </table>
    </div>
  </section>

  <section id="op-log-page" class="system-page hidden">
    <div class="system-filters">
      <label>模块
        <select id="op-log-module"></select>
      </label>
      <label>用户
        <input id="op-log-user" type="text" placeholder="姓名/账号" />
      </label>
      <label>动作
        <input id="op-log-action" type="text" placeholder="例如：提交/审批/新增" />
      </label>
      <label>开始日期
        <input id="op-log-date-start" type="date" />
      </label>
      <label>结束日期
        <input id="op-log-date-end" type="date" />
      </label>
      <div class="system-filter-actions">
        <button id="op-log-export-btn" class="secondary" type="button">导出CSV</button>
        <button id="op-log-clear-btn" class="ghost-btn" type="button">清空</button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="forecast-table">
        <thead id="op-log-head"></thead>
        <tbody id="op-log-body"></tbody>
      </table>
    </div>
  </section>
</section>
`.trim();
