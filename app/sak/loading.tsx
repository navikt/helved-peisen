import { Filtere } from './Filtere'

import styles from './page.module.css'

export default function Loading() {
    return (
        <section className="flex-1 h-full max-h-full relative flex flex-col p-4">
            <Filtere />
        </section>
    )
}
