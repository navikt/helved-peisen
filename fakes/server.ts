import express from 'express'
import { type Message, Topics } from '../app/kafka/types.ts'
import { parseStringQueryParam, sleep } from './util.ts'

import testMessages from './data/messages.json' with { type: 'json' }

const app = express()
const port = 8080

app.use(express.json())

const messages = testMessages as Message[]

app.get('/api', async (req, res) => {
    const topics = parseStringQueryParam(req.query.topics) ?? Object.values(Topics)
    const key = typeof req.query.key === 'string' ? req.query.key : undefined
    const value = parseStringQueryParam(req.query.value) ?? []

    const filteredMessages = messages.filter(
        (it) =>
            topics.includes(it.topic_name) &&
            (key ? it.key === key : true) &&
            (value.length > 0 ? value.some((val) => it.value?.includes(val)) : true)
    )

    res.send(JSON.stringify(filteredMessages)).status(200)
})

app.get('/api/saker', async (req, res) => {
    const sakIdParam = typeof req.query.sakId === 'string' ? req.query.sakId : null
    const fagsystemParam = typeof req.query.fagsystem === 'string' ? req.query.fagsystem : null

    const saker = messages
        .filter((it) => it.topic_name === 'helved.saker.v1')
        .filter((it) => {
            const { sakId, fagsystem } = JSON.parse(it.key)
            return (sakIdParam ? sakId === sakIdParam : true) && (fagsystemParam ? fagsystem === fagsystemParam : true)
        })
    res.json(saker).status(200)
})

app.get('/api/saker/:sakId/:fagsystem', async (req, res) => {
    const oppdrag = messages.filter((it) => it.topic_name === 'helved.oppdrag.v1').slice(0, 4)
    await sleep(1000)
    res.json(oppdrag).status(200)
})

app.listen(port, () => {
    console.log(`Mock listening on port ${port}`)
})
