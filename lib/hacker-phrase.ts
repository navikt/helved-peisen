import phrases from './hacker-phrases.json'

export function hackerPhrase(): string {
    return phrases[Math.floor(Math.random() * phrases.length)]
}
