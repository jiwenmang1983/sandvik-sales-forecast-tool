window.APP_FORECAST_SHELL_HTML = `
<section id="forecast-periods" class="forecast-workbench hidden">
  <div class="periods-header forecast-filters">
    <label>状态
      <select id="period-status-filter">
        <option value="all">全部</option>
        <option value="open">开放中</option>
        <option value="closed">已关闭</option>
      </select>
    </label>
    <label>FC Name
      <input id="period-keyword" type="text" placeholder="输入FC Name关键字" />
    </label>
    <div class="forecast-filter-actions">
      <button id="period-reset-btn" class="ghost-btn" type="button">重置</button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="forecast-table periods-table">
      <thead>
        <tr>
          <th>FC Name</th>
          <th>填报时间</th>
          <th>销售预测周期</th>
          <th>状态</th>
          <th>审批状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="periods-body"></tbody>
    </table>
  </div>
</section>

<section id="forecast-workbench" class="forecast-workbench hidden">
  <div class="forecast-toolbar">
    <div class="forecast-toolbar-left">
      <button id="back-to-periods" class="ghost-btn" type="button">返回周期列表</button>
      <span class="tag">角色：<strong id="role-value">-</strong></span>
      <span class="tag">流程：<strong id="flow-value">-</strong></span>
      <span class="tag">周期：<strong id="period-value">-</strong></span>
      <span class="tag" id="period-window-label">填报窗口：-</span>
    </div>
    <div class="forecast-toolbar-right">
      <button id="download-template-btn" class="ghost-btn" type="button">下载模板</button>
      <button id="download-data-btn" class="ghost-btn" type="button">下载数据</button>
      <button id="upload-btn" class="ghost-btn" type="button">导入</button>
      <button id="copy-last-period-btn" class="ghost-btn" type="button">复制上期</button>
      <button id="add-row-btn" class="secondary" type="button">新增行</button>
      <button id="save-draft-btn" class="ghost-btn" type="button">保存草稿</button>
      <button id="submit-btn" class="primary" type="button">提交审批</button>
    </div>
  </div>

  <div class="forecast-filters">
    <label>客户
      <select id="customer-filter"></select>
    </label>
    <label>开票公司
      <select id="invoice-filter"></select>
    </label>
    <label>业绩归属
      <select id="performance-filter"></select>
    </label>
    <label>销售大区
      <select id="region-filter"></select>
    </label>
    <label>PA
      <select id="pa-filter"></select>
    </label>
    <label>Sub PA-1
      <select id="subpa1-filter"></select>
    </label>
    <label>Sub PA-2
      <select id="subpa2-filter"></select>
    </label>
    <div class="forecast-filter-actions">
      <button id="query-btn" class="primary" type="button">查询</button>
      <button id="reset-query-btn" class="ghost-btn" type="button">重置</button>
    </div>
  </div>

  <div id="forecast-message" class="forecast-message"></div>
  <input id="upload-input" type="file" class="hidden-file-input" />
  <table id="forecast-table" class="forecast-table">
    <colgroup id="forecast-colgroup"></colgroup>
    <thead id="forecast-head"></thead>
    <tbody id="forecast-body"></tbody>
  </table>
</section>

<section id="forecast-periods-2" class="forecast-workbench hidden">
  <div class="periods-header forecast-filters">
    <label>状态
      <select id="period-status-filter-2">
        <option value="all">全部</option>
        <option value="open">开放中</option>
        <option value="closed">已关闭</option>
      </select>
    </label>
    <label>FC Name
      <input id="period-keyword-2" type="text" placeholder="输入FC Name关键字" />
    </label>
    <div class="forecast-filter-actions">
      <button id="period-reset-btn-2" class="ghost-btn" type="button">重置</button>
    </div>
  </div>
  <div class="table-wrap">
    <table class="forecast-table periods-table">
      <thead>
        <tr>
          <th>FC Name</th>
          <th>填报时间</th>
          <th>销售预测周期</th>
          <th>状态</th>
          <th>审批状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="periods-body-2"></tbody>
    </table>
  </div>
</section>

<section id="forecast-workbench-2" class="forecast-workbench hidden">
  <div class="forecast-toolbar">
    <div class="forecast-toolbar-left">
      <button id="back-to-periods-2" class="ghost-btn" type="button">返回周期列表</button>
    </div>
    <div class="forecast-toolbar-right">
      <button id="download-template-btn-2" class="ghost-btn" type="button">下载模板</button>
      <button id="download-data-btn-2" class="ghost-btn" type="button">下载数据</button>
      <button id="upload-btn-2" class="ghost-btn" type="button">导入</button>
      <button id="copy-last-period-btn-2" class="ghost-btn" type="button">复制上期</button>
      <button id="add-row-btn-2" class="secondary" type="button">新增行</button>
      <button id="save-draft-btn-2" class="ghost-btn" type="button">保存草稿</button>
      <button id="submit-btn-2" class="primary" type="button">提交审批</button>
    </div>
  </div>

  <div class="forecast-filters">
    <label>客户
      <select id="customer-filter-2"></select>
    </label>
    <label>开票公司
      <select id="invoice-filter-2"></select>
    </label>
    <label>业绩归属
      <select id="performance-filter-2"></select>
    </label>
    <label>销售大区
      <select id="region-filter-2"></select>
    </label>
    <label>PA
      <select id="pa-filter-2"></select>
    </label>
    <label>Sub PA-1
      <select id="subpa1-filter-2"></select>
    </label>
    <label>Sub PA-2
      <select id="subpa2-filter-2"></select>
    </label>
    <label>年月
      <select id="forecast-filter-ym-2"></select>
    </label>
    <div class="forecast-filter-actions">
      <button id="query-btn-2" class="primary" type="button">查询</button>
      <button id="reset-query-btn-2" class="ghost-btn" type="button">重置</button>
    </div>
  </div>

  <div id="forecast-message-2" class="forecast-message"></div>
  <input id="upload-input-2" type="file" class="hidden-file-input" />
  <table id="forecast-table-2" class="forecast-table">
    <colgroup id="forecast-colgroup-2"></colgroup>
    <thead id="forecast-head-2"></thead>
    <tbody id="forecast-body-2"></tbody>
  </table>
</section>
`.trim();
