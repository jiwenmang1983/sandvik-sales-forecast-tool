<template>
  <div class="product-cascade">
    <a-row :gutter="[12, 12]">
      <a-col :span="4">
        <span class="cascade-label">L1 产品线</span>
        <a-select
          v-model:value="selectedL1"
          :disabled="disabled"
          placeholder="选择产品线"
          style="width: 100%"
          allow-clear
          @change="onL1Change"
        >
          <a-select-option v-for="p in l1Products" :key="p.id" :value="p.id">
            {{ p.productName }} ({{ p.productCode }})
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="4">
        <span class="cascade-label">L2 产品组</span>
        <a-select
          v-model:value="selectedL2"
          :disabled="disabled || !selectedL1"
          placeholder="选择产品组"
          style="width: 100%"
          allow-clear
          @change="onL2Change"
        >
          <a-select-option v-for="p in l2Products" :key="p.id" :value="p.id">
            {{ p.productName }} ({{ p.productCode }})
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="4">
        <span class="cascade-label">L3 产品类型</span>
        <a-select
          v-model:value="selectedL3"
          :disabled="disabled || !selectedL2"
          placeholder="选择产品类型"
          style="width: 100%"
          allow-clear
          @change="onL3Change"
        >
          <a-select-option v-for="p in l3Products" :key="p.id" :value="p.id">
            {{ p.productName }} ({{ p.productCode }})
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="4">
        <span class="cascade-label">L4 产品子类</span>
        <a-select
          v-model:value="selectedL4"
          :disabled="disabled || !selectedL3"
          placeholder="选择产品子类"
          style="width: 100%"
          allow-clear
          @change="onL4Change"
        >
          <a-select-option v-for="p in l4Products" :key="p.id" :value="p.id">
            {{ p.productName }} ({{ p.productCode }})
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="4">
        <span class="cascade-label">L5 具体型号</span>
        <a-select
          v-model:value="selectedL5"
          :disabled="disabled || !selectedL4"
          placeholder="选择具体型号"
          style="width: 100%"
          allow-clear
          @change="onL5Change"
        >
          <a-select-option v-for="p in l5Products" :key="p.id" :value="p.id">
            {{ p.productName }} ({{ p.productCode }})
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="4">
        <a-button type="primary" @click="resetSelection" style="margin-top: 22px">
          重置
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getLevel1Products, getProductChildren } from '@/api/products'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'change'])

// Product lists for each level
const l1Products = ref([])
const l2Products = ref([])
const l3Products = ref([])
const l4Products = ref([])
const l5Products = ref([])

// Selected values for each level
const selectedL1 = ref(null)
const selectedL2 = ref(null)
const selectedL3 = ref(null)
const selectedL4 = ref(null)
const selectedL5 = ref(null)

// Current selections as objects
const currentL1 = ref(null)
const currentL2 = ref(null)
const currentL3 = ref(null)
const currentL4 = ref(null)
const currentL5 = ref(null)

// Load L1 products on mount
onMounted(async () => {
  await loadL1Products()
})

// Load L1 products
const loadL1Products = async () => {
  try {
    const res = await getLevel1Products()
    if (res && res.success && res.data) {
      l1Products.value = res.data
    }
  } catch (err) {
    console.error('Failed to load L1 products:', err)
  }
}

// L1 selection changed - load L2 children
const onL1Change = async () => {
  selectedL2.value = null
  selectedL3.value = null
  selectedL4.value = null
  selectedL5.value = null
  l2Products.value = []
  l3Products.value = []
  l4Products.value = []
  l5Products.value = []
  currentL1.value = null
  currentL2.value = null
  currentL3.value = null
  currentL4.value = null
  currentL5.value = null

  if (selectedL1.value) {
    currentL1.value = l1Products.value.find(p => p.id === selectedL1.value)
    await loadChildren(selectedL1.value, 2)
  }
  emitSelection()
}

// L2 selection changed - load L3 children
const onL2Change = async () => {
  selectedL3.value = null
  selectedL4.value = null
  selectedL5.value = null
  l3Products.value = []
  l4Products.value = []
  l5Products.value = []
  currentL2.value = null
  currentL3.value = null
  currentL4.value = null
  currentL5.value = null

  if (selectedL2.value) {
    currentL2.value = l2Products.value.find(p => p.id === selectedL2.value)
    await loadChildren(selectedL2.value, 3)
  }
  emitSelection()
}

// L3 selection changed - load L4 children
const onL3Change = async () => {
  selectedL4.value = null
  selectedL5.value = null
  l4Products.value = []
  l5Products.value = []
  currentL3.value = null
  currentL4.value = null
  currentL5.value = null

  if (selectedL3.value) {
    currentL3.value = l3Products.value.find(p => p.id === selectedL3.value)
    await loadChildren(selectedL3.value, 4)
  }
  emitSelection()
}

// L4 selection changed - load L5 children
const onL4Change = async () => {
  selectedL5.value = null
  l5Products.value = []
  currentL4.value = null
  currentL5.value = null

  if (selectedL4.value) {
    currentL4.value = l4Products.value.find(p => p.id === selectedL4.value)
    await loadChildren(selectedL4.value, 5)
  }
  emitSelection()
}

// L5 selection changed
const onL5Change = () => {
  currentL5.value = selectedL5.value ? l5Products.value.find(p => p.id === selectedL5.value) : null
  emitSelection()
}

// Load children for a given parent
const loadChildren = async (parentId, targetLevel) => {
  try {
    const res = await getProductChildren(parentId)
    if (res && res.success && res.data) {
      if (targetLevel === 2) l2Products.value = res.data
      else if (targetLevel === 3) l3Products.value = res.data
      else if (targetLevel === 4) l4Products.value = res.data
      else if (targetLevel === 5) l5Products.value = res.data
    }
  } catch (err) {
    console.error(`Failed to load L${targetLevel} products:`, err)
  }
}

// Emit the current selection
const emitSelection = () => {
  const result = {
    l1: currentL1.value,
    l2: currentL2.value,
    l3: currentL3.value,
    l4: currentL4.value,
    l5: currentL5.value,
    selected: currentL5.value || currentL4.value || currentL3.value || currentL2.value || currentL1.value
  }
  emit('select', result)
  emit('change', result)
}

// Reset selection
const resetSelection = () => {
  selectedL1.value = null
  selectedL2.value = null
  selectedL3.value = null
  selectedL4.value = null
  selectedL5.value = null
  l2Products.value = []
  l3Products.value = []
  l4Products.value = []
  l5Products.value = []
  currentL1.value = null
  currentL2.value = null
  currentL3.value = null
  currentL4.value = null
  currentL5.value = null
  emitSelection()
}

// Watch for disabled prop changes
watch(() => props.disabled, (newVal) => {
  if (newVal) {
    resetSelection()
  }
})
</script>

<style scoped>
.product-cascade {
  padding: 8px 0;
}

.cascade-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
