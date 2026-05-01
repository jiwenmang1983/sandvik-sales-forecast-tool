window.APP_APPROVAL_SHELL_HTML = `
<section id="approval-workbench" class="approval-workbench forecast-workbench hidden">
  <div class="approval-filters">
    <label>FC Name
      <select id="approval-period-filter"></select>
    </label>
    <label>区域总监
      <select id="approval-director-filter"></select>
    </label>
    <label>销售
      <select id="approval-sales-filter"></select>
    </label>
    <label>状态
      <select id="approval-status-filter">
        <option value="all">全部</option>
        <option value="draft">草稿</option>
        <option value="submitted_director">已提交区域总监</option>
        <option value="submitted_finance">已提交财务审核</option>
        <option value="approved">已通过</option>
        <option value="rejected">已退回</option>
      </select>
    </label>
    <div class="approval-filter-actions">
      <button id="approval-query-btn" class="primary" type="button">查询</button>
      <button id="approval-reset-btn" class="ghost-btn" type="button">重置</button>
    </div>
  </div>

  <section id="approval-list-page">
    <div class="table-wrap">
      <table class="forecast-table approval-list-table">
        <thead>
          <tr>
            <th>FC Name</th>
            <th>区域总监</th>
            <th>销售</th>
            <th>订单数量</th>
            <th>开票数量</th>
            <th>订单金额</th>
            <th>开票金额</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="approval-list-body"></tbody>
      </table>
    </div>
  </section>

  <section id="approval-detail-page" class="approval-detail hidden">
    <div class="approval-detail-header">
      <div class="approval-actions-wrap">
        <button id="approval-back-btn" class="ghost-btn" type="button">返回列表</button>
        <h4 id="approval-detail-title">-</h4>
      </div>
      <div class="approval-actions-wrap">
        <div class="approval-actions">
          <button id="approval-download-btn" class="ghost-btn" type="button">数据下载</button>
          <button id="approval-adjust-btn" class="secondary" type="button">调整</button>
          <button id="approval-reject-btn" class="ghost-btn" type="button">退回</button>
          <button id="approval-pass-btn" class="primary" type="button">通过</button>
        </div>
      </div>
    </div>

    <div class="approval-summary-tabs">
      <button id="summary-by-customer" class="summary-tab active" type="button">按客户</button>
      <button id="summary-by-performance" class="summary-tab" type="button">按业绩归属</button>
      <button id="summary-by-region" class="summary-tab" type="button">按销售大区</button>
      <button id="summary-detail-tab" class="summary-tab" type="button">明细</button>
    </div>

    <div class="table-wrap">
      <table class="forecast-table approval-summary-table">
        <thead id="approval-summary-customer-head"></thead>
        <tbody id="approval-summary-by-customer-body"></tbody>
      </table>
    </div>

    <div id="approval-customer-panel"></div>

    <div id="approval-summary-panel" class="hidden">
      <div class="table-wrap">
        <table class="forecast-table approval-summary-table">
          <thead id="approval-summary-head"></thead>
          <tbody id="approval-summary-body"></tbody>
        </table>
      </div>
    </div>

    <div id="approval-detail-data-panel" class="hidden">
      <div class="table-wrap">
        <table class="forecast-table approval-detail-table">
          <thead id="approval-detail-head"></thead>
          <tbody id="approval-detail-body"></tbody>
        </table>
      </div>
    </div>
  </section>
</section>
`.trim();
