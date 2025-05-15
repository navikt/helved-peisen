import express from 'express'
import { TestData } from './testData.ts'
import {
    getTaskQueryParameters,
    parseStringQueryParam,
} from './queryParameters.ts'
import { sleep } from './util.ts'
import { Topics } from '../app/kafka/types.ts'
import { subDays } from 'date-fns'

const app = express()
const port = 8080

app.use(express.json())

const tasks: Record<string, Task> = {}
const taskHistory: Record<string, TaskHistory[]> = {}

for (const task of TestData.tasks(85)) {
    tasks[task.id] = task
    taskHistory[task.id] = TestData.taskHistory(task.id)
}

const messages = TestData.messages([], {
    size: 10_000,
    fom: subDays(new Date(), 30),
    tom: new Date(),
}).sort((a, b) => a.topic_name.localeCompare(b.topic_name))

for (let i = 1; i < messages.length; i++) {
    if (messages[i].topic_name === messages[i - 1].topic_name) {
        messages[i].offset = messages[i - 1].offset + 1
    } else {
        messages[i].offset = 1
    }
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

shuffleArray(messages)

/* KAFKA */
app.get('/api', async (req, res) => {
    const fom = typeof req.query.fom === 'string' ? req.query.fom : undefined
    const tom = typeof req.query.tom === 'string' ? req.query.tom : undefined
    const topics =
        parseStringQueryParam(req.query.topics) ?? Object.values(Topics)
    const limit = req.query.limit ? +req.query.limit : 1000
    const key = typeof req.query.key === 'string' ? req.query.key : undefined
    const value =
        parseStringQueryParam(req.query.value) ?? []

    const fomDate = fom ? new Date(fom).getTime() : 0
    const tomDate = tom ? new Date(tom).getTime() : Number.MAX_SAFE_INTEGER

    const filteredMessages = messages
        .filter(
            (it) =>
                it.timestamp_ms >= fomDate &&
                it.timestamp_ms <= tomDate &&
                topics.includes(it.topic_name) &&
                (key ? it.key === key : true) &&
                (value.length > 0 ? value.some(val => it.value?.includes(val)) : true)
        )
        .slice(0, limit)

    await sleep(100)
    res.send(JSON.stringify(filteredMessages)).status(200)
})
/* MANUELL KVITTERING ENDPOINT */
app.post('/api/manuell-kvittering', async (req, res) => {
    res.status(200).json({ success: true, message: 'Kvittering ble lagt til' })
})
/* TASKS */

app.get('/api/tasks', async (req, res) => {
    const { page, pageSize, status, kind } = getTaskQueryParameters(req)

    const allTasks = Object.values(tasks)
        .filter((it) => status.length === 0 || status.includes(it.status))
        .filter((it) => !kind || it.kind === kind)
    const currentPage = Math.min(page, Math.ceil(allTasks.length / pageSize))
    const start = (currentPage - 1) * pageSize
    const paginatedTasks = allTasks.slice(start, start + pageSize)

    const body = {
        tasks: paginatedTasks,
        page: currentPage,
        pageSize: pageSize,
        totalTasks: allTasks.length,
    }
    await sleep(100)
    res.send(JSON.stringify(body)).status(200)
})

app.get('/api/tasks/:taskId/history', async (req, res) => {
    const body = taskHistory[req.params.taskId]
    await sleep(50)
    res.send(JSON.stringify(body)).status(200)
})

app.patch('/api/tasks/:taskId', async (req, res) => {
    const requestBody = req.body as {
        message: string
        status: TaskStatus
    }

    tasks[req.params.taskId] = {
        ...tasks[req.params.taskId],
        ...requestBody,
    }

    await sleep(500)
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`Utsjekk mock listening on port ${port}`)
})
