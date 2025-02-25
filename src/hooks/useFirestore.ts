import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    QueryConstraint,
    DocumentData
} from 'firebase/firestore';

interface FirestoreOptions {
    collectionName: string;
    constraints?: QueryConstraint[];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
}

export function useFirestore<T = DocumentData>({
    collectionName,
    constraints = [],
    orderByField,
    orderDirection = 'desc',
    limitCount
}: FirestoreOptions) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);

        // Build query constraints
        const queryConstraints: QueryConstraint[] = [...constraints];

        // Add orderBy if specified
        if (orderByField) {
            queryConstraints.push(orderBy(orderByField, orderDirection));
        }

        // Add limit if specified
        if (limitCount) {
            queryConstraints.push(limit(limitCount));
        }

        // Create query
        const q = query(collection(db, collectionName), ...queryConstraints);

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const results: T[] = [];
                snapshot.forEach((doc) => {
                    results.push({ id: doc.id, ...doc.data() } as T);
                });
                setData(results);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(err);
                setLoading(false);
            }
        );

        // Clean up listener on unmount
        return () => unsubscribe();
    }, [collectionName, JSON.stringify(constraints), orderByField, orderDirection, limitCount]);

    return { data, loading, error };
} 