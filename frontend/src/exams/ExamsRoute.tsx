import './exams.css';

import { useEffect, useSyncExternalStore } from 'react';
import { api } from '../api';
import { ExamsContainer } from './ExamsContainer';

export function ExamsRoute() {
    const context = useSyncExternalStore(
        api.userExams.context.subscribe,
        api.userExams.context.getSnapshot,
        api.userExams.context.getSnapshot,
    );

    useEffect(() => {
        void api.userExams.context.initialize().catch((cause: unknown) => {
            console.error('failed to load exams:', cause);
        });
    }, []);

    return (
        <section className="section">
            <ExamsContainer exams={context.exams} />
        </section>
    );
}
