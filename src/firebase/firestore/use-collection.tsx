'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    console.log("useCollection DEBUG: useEffect triggered. Query object:", memoizedTargetRefOrQuery);
    if (!memoizedTargetRefOrQuery) {
      console.log("useCollection DEBUG: No query provided. Resetting state.");
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()
    
    console.log(`useCollection DEBUG: Setting up snapshot listener for path: ${path}`);
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        console.log(`useCollection DEBUG: Snapshot received for path: ${path}. Document count: ${snapshot.size}`);
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        console.log("useCollection DEBUG: Successfully processed data.", results);
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        console.log(`useCollection DEBUG: onSnapshot error callback triggered for path: ${path}`);
        console.error("useCollection DEBUG: Raw Firestore error object:", error);
        
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })
        console.log("useCollection DEBUG: Created contextual permission error.");

        setError(contextualError)
        console.log("useCollection DEBUG: Set local error state.");
        
        setData(null)
        console.log("useCollection DEBUG: Cleared local data state.");
        
        setIsLoading(false)
        console.log("useCollection DEBUG: Set loading state to false.");

        // trigger global error propagation
        console.log("useCollection DEBUG: Emitting global 'permission-error' event.");
        errorEmitter.emit('permission-error', contextualError);
        console.log("useCollection DEBUG: Global 'permission-error' event emitted.");
      }
    );

    console.log(`useCollection DEBUG: Subscription created for ${path}.`);

    return () => {
        console.log(`useCollection DEBUG: Unsubscribing from snapshot listener for path: ${path}`);
        unsubscribe();
    };
  }, [memoizedTargetRefOrQuery]);
  
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    console.warn("useCollection WARNING: The provided query was not memoized with useMemoFirebase. This can lead to infinite loops.", memoizedTargetRefOrQuery);
    throw new Error('A query passed to useCollection was not properly memoized using useMemoFirebase');
  }

  console.log("useCollection DEBUG: Hook is returning state. Is loading:", isLoading, "Has error:", !!error, "Has data:", !!data);
  return { data, isLoading, error };
}
