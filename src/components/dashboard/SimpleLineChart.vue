<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: { label: string; value: number }[]
    formatValue?: (n: number) => string
    variant?: 'primary' | 'accent'
  }>(),
  { variant: 'primary' },
)

const width = 400
const height = 192
const pad = { top: 28, right: 16, bottom: 32, left: 16 }

const colors = {
  primary: {
    stroke: '#534ab7',
    fillStart: 'rgb(83 74 183 / 0.28)',
    fillEnd: 'rgb(83 74 183 / 0)',
    dot: '#534ab7',
    grid: 'rgb(83 74 183 / 0.08)',
  },
  accent: {
    stroke: '#0f6e56',
    fillStart: 'rgb(15 110 86 / 0.22)',
    fillEnd: 'rgb(15 110 86 / 0)',
    dot: '#0f6e56',
    grid: 'rgb(15 110 86 / 0.08)',
  },
}

const palette = computed(() => colors[props.variant])

const max = computed(() => Math.max(...props.data.map((d) => d.value), 1))

const innerW = width - pad.left - pad.right
const innerH = height - pad.top - pad.bottom

const coords = computed(() => {
  const n = props.data.length
  if (n === 0) return []
  const step = n > 1 ? innerW / (n - 1) : 0
  return props.data.map((d, i) => ({
    x: pad.left + (n > 1 ? i * step : innerW / 2),
    y: pad.top + innerH - (d.value / max.value) * innerH,
    label: d.label,
    value: d.value,
  }))
})

function smoothPath(points: { x: number; y: number }[], closeBottom = false) {
  if (points.length === 0) return ''
  const first = points[0]!
  if (points.length === 1) {
    const base = height - pad.bottom
    return closeBottom
      ? `M ${first.x} ${base} L ${first.x} ${first.y} L ${first.x} ${base} Z`
      : `M ${first.x} ${first.y}`
  }

  let d = `M ${first.x} ${first.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]!
    const p1 = points[i + 1]!
    const cx = (p0.x + p1.x) / 2
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`
  }

  if (closeBottom) {
    const last = points[points.length - 1]!
    const base = height - pad.bottom
    d += ` L ${last.x} ${base} L ${first.x} ${base} Z`
  }
  return d
}

const linePath = computed(() => smoothPath(coords.value))
const areaPath = computed(() => smoothPath(coords.value, true))

const gridLines = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => {
    const y = pad.top + (innerH / steps) * i
    return y
  })
})

function defaultFormat(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}k`
  return String(n)
}

const format = (n: number) => (props.formatValue ?? defaultFormat)(n)

const labelStep = computed(() => {
  const n = props.data.length
  if (n <= 6) return 1
  if (n <= 12) return 2
  return Math.ceil(n / 6)
})
</script>

<template>
  <div class="relative h-48 w-full pl-7">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="h-full w-full overflow-visible"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="`area-${variant}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="palette.fillStart" />
          <stop offset="100%" :stop-color="palette.fillEnd" />
        </linearGradient>
      </defs>

      <line
        v-for="(y, i) in gridLines"
        :key="i"
        :x1="pad.left"
        :y1="y"
        :x2="width - pad.right"
        :y2="y"
        :stroke="palette.grid"
        stroke-width="1"
        stroke-dasharray="4 6"
      />

      <path
        v-if="areaPath"
        :d="areaPath"
        :fill="`url(#area-${variant})`"
        class="transition-all duration-500"
      />
      <path
        v-if="linePath"
        :d="linePath"
        fill="none"
        :stroke="palette.stroke"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-all duration-500"
      />

      <circle
        v-for="(p, i) in coords"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="4"
        fill="white"
        :stroke="palette.dot"
        stroke-width="2"
        class="transition-all duration-500"
      />
    </svg>

    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-7">
      <span
        v-for="(point, i) in data"
        v-show="i % labelStep === 0 || i === data.length - 1"
        :key="`${point.label}-${i}`"
        class="absolute max-w-[3rem] -translate-x-1/2 truncate text-center text-[10px] text-muted-foreground"
        :style="{ left: `${((coords[i]?.x ?? 0) / width) * 100}%` }"
      >
        {{ point.label }}
      </span>
    </div>

    <div
      class="pointer-events-none absolute left-0 top-3 flex h-[calc(100%-2rem)] flex-col justify-between py-1 pl-0.5 text-[10px] font-medium tabular-nums text-muted-foreground"
    >
      <span>{{ format(max) }}</span>
      <span v-if="max > 0">{{ format(Math.round(max / 2)) }}</span>
      <span class="pb-6">0</span>
    </div>
  </div>
</template>
