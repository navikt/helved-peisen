import { Chart, ChartEvent, ChartType, Plugin, Scale } from 'chart.js'

type BrushOpts = {
    fillStyle?: string
    strokeStyle?: string
    minPixels?: number
    onSelect?: (range: { min: number; max: number }, chart: Chart) => void
}

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        brush?: BrushOpts
    }
}

type State = {
    dragging: boolean
    start: number | null
    end: number | null
}

const stateMap = new WeakMap<Chart, State>()

const clamp = (n: number, max: number, min: number) => Math.min(Math.max(n, max), min)

// Request a single draw per frame
let rafId: number | null = null
const requestDraw = (chart: Chart) => {
    if (rafId != null) return
    rafId = requestAnimationFrame(() => {
        rafId = null
        chart.draw()
    })
}

const getX = (chart: Chart, event: ChartEvent): number | null => {
    if (typeof event.x === 'number') {
        return event.x
    }

    return event.native && 'clientX' in event.native ? (event.native.clientX as number) : null
}

export const BrushPlugin: Plugin<ChartType, BrushOpts> = {
    id: 'brush',

    afterInit(chart) {
        stateMap.set(chart, { dragging: false, start: null, end: null })
    },

    beforeEvent(chart, args, opts) {
        const state = stateMap.get(chart)!
        const event = args.event as ChartEvent
        const { chartArea } = chart

        // Start drag
        if (event.type === 'mousedown') {
            const x = getX(chart, event)
            if (!x) return
            if (x >= chartArea.left && x <= chartArea.right) {
                state.dragging = true
                state.start = clamp(x, chartArea.left, chartArea.right)
                state.end = state.start
                requestDraw(chart)
            }
            return
        }

        // Drag move
        if (event.type === 'mousemove' && state.dragging) {
            const x = getX(chart, event)
            if (!x) return
            state.end = clamp(x, chartArea.left, chartArea.right)
            requestDraw(chart)
            return
        }

        // End drag
        if ((event.type === 'mouseup' || event.type === 'mouseout') && state.dragging) {
            state.dragging = false

            const start = state.start ?? 0
            const end = state.end ?? 0
            const minPx = Math.min(start, end)
            const maxPx = Math.max(start, end)

            const minPixels = opts?.minPixels ?? 4
            if (maxPx - minPx >= minPixels) {
                const xScale: Scale = chart.scales.x
                const minVal = xScale.getValueForPixel(minPx) ?? 0
                const maxVal = xScale.getValueForPixel(maxPx) ?? 0
                opts?.onSelect?.({ min: minVal, max: maxVal }, chart)
            }

            state.start = state.end = null
            requestDraw(chart)
        }
    },

    afterDatasetsDraw(chart, _args, opts) {
        const state = stateMap.get(chart)!
        if (state.start == null || state.end == null) return

        const { ctx, chartArea } = chart
        const left = Math.min(state.start, state.end)
        const width = Math.abs(state.end - state.start)
        const height = chartArea.bottom - chartArea.top

        ctx.save()
        ctx.fillStyle = opts?.fillStyle ?? 'rgba(99,102,241,0.15)'
        ctx.strokeStyle = opts?.strokeStyle ?? 'rgba(99,102,241,0.5)'
        ctx.fillRect(left, chartArea.top, width, height)
        ctx.strokeRect(left, chartArea.top, width, height)
        ctx.restore()
    },
}
