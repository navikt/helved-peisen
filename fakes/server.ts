import express from 'express'
import { TestData } from './testData.ts'
import { getTaskQueryParameters } from './queryParameters.ts'
import { sleep } from './util.ts'

const app = express()
const port = 8080

app.use(express.json())

const tasks: Record<string, Task> = {}
const taskHistory: Record<string, TaskHistory[]> = {}

for (const task of TestData.tasks(85)) {
    tasks[task.id] = task
    taskHistory[task.id] = TestData.taskHistory(task.id)
}

/* KAFKA */
app.get('/api/messages', async (req, res) => {
    const messages = TestData.messages()
    await sleep(100)
    res.send(JSON.stringify(messages)).status(200)
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
