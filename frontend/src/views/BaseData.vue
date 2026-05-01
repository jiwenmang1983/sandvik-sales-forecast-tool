<template>
  <div class="basedata-page">
    <a-card :bordered="false" class="main-card">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 产品库 Tab -->
        <a-tab-pane key="productLibrary" tab="🗃️ 产品库">
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <a-input v-model:value="keyword" placeholder="搜索产品（SKU/PA/名称）..." allow-clear style="width:260px" />
            </div>
            <div class="toolbar-right">
              <a-button @click="handleExport('productLibrary')">📥 导出</a-button>
              <a-button type="primary" @click="openAddDialog('productLibrary')">➕ 添加产品</a-button>
            </div>
          </div>
          <div class="filter-bar">
            <div class="filter-item">
              <span class="filter-label">状态</span>
              <a-select v-model:value="filterStatus" style="width:120px" placeholder="全部">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="active">激活</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
              </a-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">PA产品线</span>
              <a-select v-model:value="filterPa" style="width:120px" placeholder="全部" allow-clear>
                <a-select-option value="">全部</a-select-option>
                <a-select-option v-for="pa in paList" :key="pa" :value="pa">{{ pa }}</a-select-option>
              </a-select>
            </div>
            <a-button size="small" @click="resetFilters">🔄 重置</a-button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU编码</th>
                  <th>PA</th>
                  <th>Sub PA-1</th>
                  <th>Sub PA-2</th>
                  <th>Sub PA-3（产品名称）</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredProducts" :key="p.id">
                  <td><span class="sku-cell">{{ p.sku }}</span></td>
                  <td>{{ p.pa }}</td>
                  <td>{{ p.subpa1 }}</td>
                  <td>{{ p.subpa2 }}</td>
                  <td>{{ p.subpa3 }}</td>
                  <td><span class="status-badge" :class="p.status === 'active' ? 'status-active' : 'status-inactive'">{{ p.status === 'active' ? '激活' : '停用' }}</span></td>
                  <td>
                    <a-space>
                      <a-button size="small" @click="editItem('productLibrary', p)">编辑</a-button>
                      <a-button size="small" danger @click="deleteItem('productLibrary', p)">删除</a-button>
                    </a-space>
                  </td>
                </tr>
                <tr v-if="filteredProducts.length === 0">
                  <td colspan="7" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-tab-pane>

        <!-- 客户信息 Tab -->
        <a-tab-pane key="customer" tab="🏢 客户信息">
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <a-input v-model:value="keyword" placeholder="搜索客户名称/编码..." allow-clear style="width:260px" />
            </div>
            <div class="toolbar-right">
              <a-button type="primary" @click="openAddDialog('customer')">➕ 添加客户</a-button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>客户名称</th>
                  <th>客户编码</th>
                  <th>客户类型</th>
                  <th>联系人</th>
                  <th>电话</th>
                  <th>邮箱</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in filteredCustomers" :key="c.id">
                  <td><span class="name-cell">{{ c.name }}</span></td>
                  <td>{{ c.code }}</td>
                  <td>{{ c.type }}</td>
                  <td>{{ c.contact }}</td>
                  <td>{{ c.phone }}</td>
                  <td>{{ c.email }}</td>
                  <td><span class="status-badge" :class="c.status === 'active' ? 'status-active' : 'status-inactive'">{{ c.status === 'active' ? '激活' : '停用' }}</span></td>
                  <td>
                    <a-space>
                      <a-button size="small" @click="editItem('customer', c)">编辑</a-button>
                      <a-button size="small" danger @click="deleteItem('customer', c)">删除</a-button>
                    </a-space>
                  </td>
                </tr>
                <tr v-if="filteredCustomers.length === 0">
                  <td colspan="8" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-tab-pane>

        <!-- 销售区域 Tab -->
        <a-tab-pane key="regionMapping" tab="🗺️ 销售区域">
          <div class="tab-toolbar">
            <div class="toolbar-right">
              <a-button type="primary" @click="openAddDialog('regionMapping')">➕ 添加区域</a-button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>销售大区</th>
                  <th>业绩归属</th>
                  <th>对应开票公司</th>
                  <th>区域总监</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredRegions" :key="r.id">
                  <td><span class="name-cell">{{ r.region }}</span></td>
                  <td>{{ r.performance }}</td>
                  <td>{{ r.invoices.join('、') }}</td>
                  <td>{{ r.director }}</td>
                  <td><span class="status-badge" :class="r.status === 'active' ? 'status-active' : 'status-inactive'">{{ r.status === 'active' ? '激活' : '停用' }}</span></td>
                  <td>
                    <a-space>
                      <a-button size="small" @click="editItem('regionMapping', r)">编辑</a-button>
                      <a-button size="small" danger @click="deleteItem('regionMapping', r)">删除</a-button>
                    </a-space>
                  </td>
                </tr>
                <tr v-if="filteredRegions.length === 0">
                  <td colspan="6" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-tab-pane>

        <!-- 人员信息 Tab -->
        <a-tab-pane key="salesPerson" tab="👤 人员信息">
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <a-input v-model:value="keyword" placeholder="搜索姓名/邮箱..." allow-clear style="width:260px" />
            </div>
            <div class="toolbar-right">
              <a-button type="primary" @click="openAddDialog('salesPerson')">➕ 添加人员</a-button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>工号</th>
                  <th>邮箱</th>
                  <th>所属大区</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in filteredSalesPersons" :key="s.id">
                  <td>
                    <div class="user-cell">
                      <a-avatar :size="28" :style="{ background: avatarColor(s.name) }">{{ s.name?.charAt(0) }}</a-avatar>
                      <span>{{ s.name }}</span>
                    </div>
                  </td>
                  <td>{{ s.code }}</td>
                  <td>{{ s.email }}</td>
                  <td>{{ s.region }}</td>
                  <td><span class="status-badge" :class="s.status === 'active' ? 'status-active' : 'status-inactive'">{{ s.status === 'active' ? '激活' : '停用' }}</span></td>
                  <td>
                    <a-space>
                      <a-button size="small" @click="editItem('salesPerson', s)">编辑</a-button>
                      <a-button size="small" danger @click="deleteItem('salesPerson', s)">删除</a-button>
                    </a-space>
                  </td>
                </tr>
                <tr v-if="filteredSalesPersons.length === 0">
                  <td colspan="6" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingId ? '编辑' : '新增' + modalTitle"
      width="560px"
      @ok="saveForm"
      @cancel="showModal = false"
    >
      <div class="form-row" v-if="currentModule !== 'salesPerson'">
        <div class="form-group">
          <label class="form-label">{{ modalFields[0] }}<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" :placeholder="modalFields[0]" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ modalFields[1] }}</label>
          <a-input v-model:value="formData.code" placeholder="编码" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'productLibrary'">
        <div class="form-group">
          <label class="form-label">PA</label>
          <a-select v-model:value="formData.pa" placeholder="选择PA">
            <a-select-option v-for="pa in paList" :key="pa" :value="pa">{{ pa }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">Sub PA-1</label>
          <a-input v-model:value="formData.subpa1" placeholder="Sub PA-1" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'productLibrary'">
        <div class="form-group">
          <label class="form-label">Sub PA-2</label>
          <a-input v-model:value="formData.subpa2" placeholder="Sub PA-2" />
        </div>
        <div class="form-group">
          <label class="form-label">Sub PA-3（产品名称）</label>
          <a-input v-model:value="formData.subpa3" placeholder="Sub PA-3" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'customer'">
        <div class="form-group">
          <label class="form-label">客户类型</label>
          <a-select v-model:value="formData.type" placeholder="选择类型">
            <a-select-option value="终端">终端</a-select-option>
            <a-select-option value="经销商">经销商</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">联系人</label>
          <a-input v-model:value="formData.contact" placeholder="联系人" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'customer'">
        <div class="form-group">
          <label class="form-label">电话</label>
          <a-input v-model:value="formData.phone" placeholder="电话" />
        </div>
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <a-input v-model:value="formData.email" placeholder="邮箱" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'regionMapping'">
        <div class="form-group">
          <label class="form-label">业绩归属</label>
          <a-input v-model:value="formData.performance" placeholder="业绩归属" />
        </div>
        <div class="form-group">
          <label class="form-label">区域总监</label>
          <a-input v-model:value="formData.director" placeholder="区域总监" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'salesPerson'">
        <div class="form-group">
          <label class="form-label">姓名<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" placeholder="姓名" />
        </div>
        <div class="form-group">
          <label class="form-label">工号</label>
          <a-input v-model:value="formData.code" placeholder="工号" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'salesPerson'">
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <a-input v-model:value="formData.email" placeholder="邮箱" />
        </div>
        <div class="form-group">
          <label class="form-label">所属大区</label>
          <a-select v-model:value="formData.region" placeholder="选择大区" allow-clear>
            <a-select-option v-for="r in regionList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row-full">
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="formData.status">
            <a-select-option value="active">激活</a-select-option>
            <a-select-option value="inactive">停用</a-select-option>
          </a-select>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('productLibrary')
const currentModule = ref('productLibrary')
const keyword = ref('')
const filterStatus = ref('')
const filterPa = ref('')
const showModal = ref(false)
const editingId = ref(null)
const editingRecord = ref(null)

const formData = reactive({
  name: '', code: '', status: 'active', type: '', contact: '', phone: '', email: '',
  pa: '', subpa1: '', subpa2: '', subpa3: '', performance: '', director: '', region: '', invoices: []
})

const paList = ['刀具', '钻头', '铣刀', '量具', '夹具']
const regionList = ['华东大区', '华南大区', '华北东北大区', '西南大区']

const modalTitle = computed(() => ({
  productLibrary: '产品',
  customer: '客户',
  regionMapping: '区域',
  salesPerson: '人员'
}[currentModule.value] || ''))

const modalFields = computed(() => ({
  productLibrary: ['产品名称', 'SKU编码'],
  customer: ['客户名称', '客户编码'],
  regionMapping: ['销售大区', '区域编码'],
  salesPerson: ['姓名', '工号']
}[currentModule.value] || ['', '']))

// Data
const products = ref([
  { id: 'p1', sku: 'SKU-001', pa: '刀具', subpa1: '标准刀具', subpa2: '2刃', subpa3: '整体硬质合金钻头3xD', status: 'active' },
  { id: 'p2', sku: 'SKU-002', pa: '钻头', subpa1: '普通钻头', subpa2: '3刃', subpa3: '高性能钻头', status: 'active' },
  { id: 'p3', sku: 'SKU-003', pa: '铣刀', subpa1: '非标刀具', subpa2: '4刃', subpa3: '立铣刀', status: 'active' },
  { id: 'p4', sku: 'SKU-004', pa: '量具', subpa1: '标准刀具', subpa2: '2刃', subpa3: '卡尺', status: 'inactive' }
])

const customers = ref([
  { id: 'c1', name: '苏州精密工具', code: 'C001', type: '终端', contact: '李明', phone: '0512-12345678', email: 'liming@suzhou-tools.com', status: 'active' },
  { id: 'c2', name: '昆山智造装备', code: 'C002', type: '终端', contact: '王强', phone: '0512-87654321', email: 'wangqiang@kunshan.com', status: 'active' },
  { id: 'c3', name: '上海刃具有限公司', code: 'C003', type: '经销商', contact: '张伟', phone: '021-12345678', email: 'zhangwei@shanghai-cut.com', status: 'active' }
])

const regionMappings = ref([
  { id: 'rm1', region: '华东大区', performance: '精密工具事业部', invoices: ['山特维克商贸(上海)', '阿诺精密切削工具(成都)'], director: '张伟', status: 'active' },
  { id: 'rm2', region: '华南大区', performance: '刀具事业部', invoices: ['廊坊舍弗勒'], director: '吴昊', status: 'active' },
  { id: 'rm3', region: '华北东北大区', performance: '工业仪器事业部', invoices: ['武汉阿诺精密'], director: '孙磊', status: 'active' },
  { id: 'rm4', region: '西南大区', performance: '精密工具事业部', invoices: ['山特维克商贸(上海)'], director: '王强', status: 'active' }
])

const salesPersons = ref([
  { id: 'sp1', name: '张伟', code: 'EMP001', email: 'wei.zhang@sandvik.com', region: '华东大区', status: 'active' },
  { id: 'sp2', name: '王强', code: 'EMP002', email: 'qiang.wang@sandvik.com', region: '西南大区', status: 'active' },
  { id: 'sp3', name: '孙磊', code: 'EMP003', email: 'lei.sun@sandvik.com', region: '华北东北大区', status: 'active' },
  { id: 'sp4', name: '吴昊', code: 'EMP004', email: 'hao.wu@sandvik.com', region: '华南大区', status: 'active' }
])

const filteredProducts = computed(() => {
  let list = products.value
  if (filterStatus.value) list = list.filter(x => x.status === filterStatus.value)
  if (filterPa.value) list = list.filter(x => x.pa === filterPa.value)
  if (keyword.value) list = list.filter(x => x.sku.includes(keyword.value) || x.subpa3.includes(keyword.value))
  return list
})

const filteredCustomers = computed(() => {
  let list = customers.value
  if (filterStatus.value) list = list.filter(x => x.status === filterStatus.value)
  if (keyword.value) list = list.filter(x => x.name.includes(keyword.value) || x.code.includes(keyword.value))
  return list
})

const filteredRegions = computed(() => regionMappings.value)
const filteredSalesPersons = computed(() => salesPersons.value)

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const handleExport = (module) => {
  message.info('导出功能（演示）')
}

const resetFilters = () => {
  keyword.value = ''
  filterStatus.value = ''
  filterPa.value = ''
}

const openAddDialog = (module) => {
  currentModule.value = module
  editingId.value = null
  Object.keys(formData).forEach(k => { formData[k] = typeof formData[k] === 'string' ? '' : (Array.isArray(formData[k]) ? [] : formData[k]) })
  formData.status = 'active'
  showModal.value = true
}

const editItem = (module, record) => {
  currentModule.value = module
  editingId.value = record.id
  editingRecord.value = record
  Object.assign(formData, record)
  showModal.value = true
}

const deleteItem = (module, record) => {
  const lists = { productLibrary: products, customer: customers, regionMapping: regionMappings, salesPerson: salesPersons }
  const idx = lists[module].value.findIndex(x => x.id === record.id)
  if (idx >= 0) lists[module].value.splice(idx, 1)
  message.success('已删除')
}

const saveForm = () => {
  if (!formData.name) { message.error('请填写必填项'); return }
  const lists = { productLibrary: products, customer: customers, regionMapping: regionMappings, salesPerson: salesPersons }
  
  if (editingId.value) {
    const idx = lists[currentModule.value].value.findIndex(x => x.id === editingId.value)
    if (idx >= 0) Object.assign(lists[currentModule.value].value[idx], { ...formData })
    message.success('更新成功')
  } else {
    lists[currentModule.value].value.push({ id: 'id_' + Date.now(), ...formData })
    message.success('添加成功')
  }
  showModal.value = false
}
</script>

<style scoped>
.basedata-page {
  padding: 0;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  background: #FAFAFA;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 12px;
}

.filter-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #E2E8F0;
  white-space: nowrap;
}

.data-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #F1F5F9;
  color: #1E293B;
}

.sku-cell {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #64748B;
}

.name-cell {
  font-weight: 500;
  color: #0D3D92;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active { background: #D1FAE5; color: #059669; }
.status-inactive { background: #F1F5F9; color: #64748B; }

.empty-cell {
  text-align: center;
  color: #94A3B8;
  padding: 32px !important;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row-full {
  margin-bottom: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}
</style>
