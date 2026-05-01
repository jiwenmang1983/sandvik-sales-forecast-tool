<template>
  <div class="approval-page">
    <!-- Tabs -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="all">
          <template #tab>全部 <span class="tab-badge" :class="tabBadgeClass('all')">{{ countByStatus('all') }}</span></template>
        </a-tab-pane>
        <a-tab-pane key="pending">
          <template #tab>待审批 <span class="tab-badge tab-badge-warning">{{ countByStatus('pending') }}</span></template>
        </a-tab-pane>
        <a-tab-pane key="approved">
          <template #tab>已通过 <span class="tab-badge tab-badge-success">{{ countByStatus('approved') }}</span></template>
        </a-tab-pane>
        <a-tab-pane key="rejected">
          <template #tab>已驳回 <span class="tab-badge tab-badge-error">{{ countByStatus('rejected') }}</span></template>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Filter Bar -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">大区</span>
          <a-select v-model:value="filter.region" style="width:140px" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="r in regionList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">销售</span>
          <a-select v-model:value="filter.sales" style="width:140px" allow-clear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="s in salesList" :key="s" :value="s">{{ s }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">提交时间</span>
          <a-range-picker v-model:value="filter.dateRange" style="width:220px" />
        </div>
        <div class="filter-actions">
          <a-button @click="resetFilter">🔄 重置</a-button>
        </div>
      </div>
    </a-card>

    <!-- Approval Cards -->
    <div class="approval-list">
      <a-card
        v-for="item in filteredList"
        :key="item.id"
        :bordered="false"
        class="approval-card"
        hoverable
      >
        <div class="card-inner">
          <div class="card-main">
            <div class="card-header-row">
              <span class="fc-icon">📋</span>
              <span class="fc-name">{{ item.name }}</span>
              <span class="fc-submitter">提交人：{{ item.submitter }} · {{ item.region }}</span>
            </div>
            <div class="card-info-grid">
              <div class="info-item">
                <span class="info-label">预测周期</span>
                <span class="info-value">{{ item.period }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">预测金额</span>
                <span class="info-value">¥{{ item.amount.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">提交时间</span>
                <span class="info-value">{{ item.submitTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">当前审批人</span>
                <span class="info-value">{{ item.approver }}</span>
              </div>
            </div>
            <div class="card-footer-row">
              <span class="submit-time">提交于 {{ item.submitDate }}</span>
            </div>
          </div>
          <div class="card-actions">
            <a-tag class="status-tag" :class="statusTagClass(item.status)">{{ statusLabel(item.status) }}</a-tag>
            <div class="action-btns">
              <a-button
                v-if="item.status === 'pending'"
                type="primary"
                size="small"
                class="btn-approve"
                @click.stop="handleApprove(item)"
              >✅ 通过</a-button>
              <a-button
                v-if="item.status === 'pending'"
                size="small"
                class="btn-reject"
                @click.stop="handleReject(item)"
              >❌ 驳回</a-button>
              <a-button
                size="small"
                class="btn-detail"
                @click.stop="viewDetail(item)"
              >查看详情</a-button>
            </div>
          </div>
        </div>
      </a-card>

      <a-empty v-if="filteredList.length === 0" description="暂无审批数据" />
    </div>

    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="currentPage"
        :total="filteredList.length"
        :page-size="10"
        show-quick-jumper
      />
    </div>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="showDetailModal"
      :title="'审批详情 - ' + detailItem?.name"
      width="800px"
      :footer="null"
    >
      <a-tabs>
        <a-tab-pane key="summary" tab="汇总信息">
          <div class="detail-summary">
            <a-descriptions :column="2" bordered size="small">
              <a-descriptions-item label="预测周期">{{ detailItem?.period }}</a-descriptions-item>
              <a-descriptions-item label="提交人">{{ detailItem?.submitter }}</a-descriptions-item>
              <a-descriptions-item label="预测金额">¥{{ detailItem?.amount.toLocaleString() }}</a-descriptions-item>
              <a-descriptions-item label="提交时间">{{ detailItem?.submitTime }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-tab-pane>
        <a-tab-pane key="history" tab="审批历史">
          <div class="approval-history">
            <div class="timeline">
              <div v-for="(h, i) in approvalHistory" :key="i" class="timeline-item">
                <div class="timeline-dot" :class="h.dotClass">{{ h.step }}</div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-person">{{ h.person }}</span>
                    <span class="timeline-time">{{ h.time }}</span>
                  </div>
                  <div>{{ h.action }}</div>
                  <div v-if="h.opinion" class="timeline-opinion" :class="h.rejected ? 'rejected' : ''">{{ h.opinion }}</div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- Reject Modal -->
    <a-modal
      v-model:open="showRejectModal"
      title="驳回审批"
      @ok="confirmReject"
    >
      <div style="margin-bottom:12px;">
        <label style="font-weight:600;font-size:13px;">驳回原因</label>
      </div>
      <a-textarea v-model:value="rejectReason" :rows="4" placeholder="请输入驳回原因..." />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('all')
const currentPage = ref(1)
const showDetailModal = ref(false)
const showRejectModal = ref(false)
const detailItem = ref(null)
const rejectReason = ref('')
const rejectTarget = ref(null)

const filter = reactive({
  region: '',
  sales: '',
  dateRange: null
})

const regionList = ['华东大区', '华南大区', '华北东北大区', '西南大区']
const salesList = ['张伟', '王强', '孙磊', '吴昊', '钱坤', '李娜', '周婷']

const approvalData = ref([
  { id: 1, name: '2026FC2-华东区Q2预测', period: '2026FC2', region: '华东大区', sales: '张伟', submitter: '张伟', amount: 3500000, submitDate: '2026-04-28 14:32', submitTime: '2026-04-28 14:32', approver: '李娜', status: 'pending' },
  { id: 2, name: '2026FC2-华南区Q2预测', period: '2026FC2', region: '华南大区', sales: '吴昊', submitter: '吴昊', amount: 2800000, submitDate: '2026-04-28 10:15', submitTime: '2026-04-28 10:15', approver: '周婷', status: 'pending' },
  { id: 3, name: '2026FC2-西南区Q2预测', period: '2026FC2', region: '西南大区', sales: '王强', submitter: '王强', amount: 1950000, submitDate: '2026-04-27 16:45', submitTime: '2026-04-27 16:45', approver: '李娜', status: 'approved' },
  { id: 4, name: '2026FC2-华北区Q2预测', period: '2026FC2', region: '华北东北大区', sales: '孙磊', submitter: '孙磊', amount: 2200000, submitDate: '2026-04-27 09:20', submitTime: '2026-04-27 09:20', approver: '周婷', status: 'rejected' },
  { id: 5, name: '2026FC1-华东区Q1预测', period: '2026FC1', region: '华东大区', sales: '张伟', submitter: '张伟', amount: 3200000, submitDate: '2026-01-28 14:32', submitTime: '2026-01-28 14:32', approver: '李娜', status: 'approved' },
  { id: 6, name: '2026FC1-华南区Q1预测', period: '2026FC1', region: '华南大区', sales: '吴昊', submitter: '吴昊', amount: 2600000, submitDate: '2026-01-28 10:15', submitTime: '2026-01-28 10:15', approver: '周婷', status: 'approved' }
])

const approvalHistory = ref([
  { step: '✓', person: '系统', time: '2026-04-28 14:32', action: '提交预测', dotClass: 'timeline-dot-submit', opinion: '' },
  { step: '1', person: '李娜（区域总监）', time: '2026-04-29 09:15', action: '审批通过', dotClass: 'timeline-dot-director-approve', opinion: '数据核实无误，同意上报。' },
  { step: '2', person: '周婷（财务）', time: '2026-04-29 14:20', action: '审批通过', dotClass: 'timeline-dot-finance', opinion: '金额核对正确。' }
])

const countByStatus = (s) => s === 'all' ? approvalData.value.length : approvalData.value.filter(x => x.status === s).length

const filteredList = computed(() => {
  let list = approvalData.value
  if (activeTab.value !== 'all') list = list.filter(x => x.status === activeTab.value)
  if (filter.region) list = list.filter(x => x.region === filter.region)
  if (filter.sales) list = list.filter(x => x.sales === filter.sales)
  return list
})

const statusLabel = (s) => ({ pending: '待审批', approved: '已通过', rejected: '已驳回' }[s] || s)
const statusTagClass = (s) => ({ pending: 'tag-pending', approved: 'tag-approved', rejected: 'tag-rejected' }[s] || '')
const tabBadgeClass = (s) => s === 'all' ? 'tab-badge-default' : ''

const handleApprove = (item) => {
  item.status = 'approved'
  message.success('已通过：' + item.name)
}

const handleReject = (item) => {
  rejectTarget.value = item
  rejectReason.value = ''
  showRejectModal.value = true
}

const confirmReject = () => {
  if (!rejectReason.value) { message.error('请填写驳回原因'); return }
  if (rejectTarget.value) rejectTarget.value.status = 'rejected'
  showRejectModal.value = false
  message.success('已驳回')
}

const viewDetail = (item) => {
  detailItem.value = item
  showDetailModal.value = true
}

const resetFilter = () => {
  filter.region = ''
  filter.sales = ''
  filter.dateRange = null
}
</script>

<style scoped>
.approval-page { }

.tab-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  line-height: 18px;
}
.tab-badge-warning { background: #FFF7E6; color: #FAAD14; }
.tab-badge-success { background: #F6FFED; color: #52C41A; }
.tab-badge-error { background: #FFF2F0; color: #FF4D4F; }
.tab-badge-default { background: #F3F4F6; color: #6B7280; }

.filter-bar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 12px 4px; }
.filter-item { display: flex; flex-direction: column; gap: 3px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.filter-actions { display: flex; gap: 8px; margin-left: auto; }

.approval-list { display: flex; flex-direction: column; gap: 12px; }
.approval-card { border-radius: 8px; }
.card-inner { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 0; }
.card-main { flex: 1; min-width: 0; }
.card-header-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.fc-icon { color: #0D3D92; font-size: 18px; }
.fc-name { font-size: 15px; font-weight: 600; color: #0D3D92; }
.fc-submitter { color: #6B7280; font-size: 13px; }
.card-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px 24px; margin-bottom: 8px; }
.info-item { display: flex; font-size: 13px; color: #6B7280; }
.info-item .info-label { width: 70px; flex-shrink: 0; }
.info-item .info-value { color: #1F2937; font-weight: 500; }
.card-footer-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.submit-time { font-size: 12px; color: #6B7280; }
.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }

.status-tag { font-size: 12px; padding: 2px 10px; border-radius: 4px; }
.tag-pending { background: #FFF7E6; color: #D46B08; border: 1px solid #FFE58D; }
.tag-approved { background: #F6FFED; color: #389E0D; border: 1px solid #B7EB8F; }
.tag-rejected { background: #FFF2F0; color: #CF1322; border: 1px solid #FFCCC7; }

.action-btns { display: flex; flex-direction: column; gap: 6px; }
.btn-approve { background: #52C41A; border-color: #52C41A; color: #fff; }
.btn-approve:hover { background: #3cb614; border-color: #3cb614; color: #fff; }
.btn-reject { color: #FF4D4F; }
.btn-reject:hover { background: #FF4D4F; color: #fff; }
.btn-detail { color: #0D3D92; }

.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }

.timeline { position: relative; padding-left: 28px; }
.timeline::before { content: ''; position: absolute; left: 9px; top: 4px; bottom: 4px; width: 2px; background: #E5E7EB; }
.timeline-item { position: relative; margin-bottom: 16px; font-size: 13px; }
.timeline-item:last-child { margin-bottom: 0; }
.timeline-dot { position: absolute; left: -24px; top: 2px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; background: #E6F7FF; }
.timeline-dot-submit { background: #FFF7E6; }
.timeline-dot-director-approve { background: #F6FFED; }
.timeline-dot-director-reject { background: #FFF2F0; }
.timeline-dot-finance { background: #F6FFED; }
.timeline-content { color: #1F2937; }
.timeline-header { font-weight: 500; margin-bottom: 4px; }
.timeline-person { color: #0D3D92; }
.timeline-time { color: #6B7280; font-size: 12px; margin-left: 8px; }
.timeline-opinion { margin-top: 4px; padding: 8px 12px; background: #fff; border-radius: 4px; border: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; }
.timeline-opinion.rejected { border-color: #FFCCC7; background: #FFF2F0; color: #CF1322; }
.detail-summary { padding: 12px 0; }
</style>
