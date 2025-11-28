
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  doc,
  increment,
  CollectionReference,
  DocumentReference,
  Firestore,
  SetOptions,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';
import { User } from 'firebase/auth';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}

/**
 * Adds a new post to the 'posts' collection in Firestore.
 */
export function addPost(firestore: Firestore, postData: any, user: User | null) {
  if (!user) {
    throw new Error("User must be logged in to create a post.");
  }
  const postsCollection = collection(firestore, 'posts');
  
  const authorData = {
    name: user.displayName || 'Anonymous User',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    uid: user.uid,
  };

  return addDocumentNonBlocking(postsCollection, {
    ...postData,
    author: authorData,
    likes: 0,
    comments: 0,
    reposts: 0,
    shares: 0,
    timestamp: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

/**
 * Adds a new comment to a post's or task's 'comments' subcollection.
 */
export function addComment(firestore: Firestore, parentPath: string, commentText: string, user: User, isTaskComment: boolean = false) {
    const commentsCollection = collection(firestore, parentPath, 'comments');
    const parentRef = doc(firestore, parentPath);

    const commentData = {
        authorId: user.uid,
        content: commentText,
        likes: 0,
        createdAt: serverTimestamp(),
    };

    const batch = writeBatch(firestore);
    
    const newCommentRef = doc(commentsCollection);
    batch.set(newCommentRef, commentData);
    
    if (!isTaskComment) {
        batch.update(parentRef, { comments: increment(1) });
    }
    
    batch.commit().catch(error => {
        console.error("Error in addComment batch write:", { path: parentRef.path, error });
        const permissionError = new FirestorePermissionError({
            path: `batch write to ${parentRef.path} and ${newCommentRef.path}`,
            operation: 'write',
            requestResourceData: { parentUpdate: { comments: 'increment' }, newComment: commentData },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}


/**
 * Adds a new reply to a comment's 'replies' subcollection in Firestore.
 */
export function addReply(firestore: Firestore, basePath: string, replyText: string, user: User) {
  const repliesCollection = collection(firestore, basePath, 'replies');

  return addDocumentNonBlocking(repliesCollection, {
    authorId: user.uid,
    content: replyText,
    likes: 0,
    createdAt: serverTimestamp(),
  });
}

/**
 * Toggles a like on a post.
 */
export function toggleLikePost(firestore: Firestore, postId: string, isLiked: boolean) {
    const postRef = doc(firestore, 'posts', postId);
    const likeIncrement = isLiked ? increment(-1) : increment(1);
    return updateDocumentNonBlocking(postRef, {
        likes: likeIncrement
    });
}

/**
 * Toggles a like on a comment.
 */
export function toggleLikeComment(firestore: Firestore, parentId: string, commentId: string, isLiked: boolean, isTaskComment: boolean = false, projectId?: string | null) {
    let commentRef;
    if (isTaskComment && projectId) {
        commentRef = doc(firestore, 'projects', projectId, 'tasks', parentId, 'comments', commentId);
    } else {
        commentRef = doc(firestore, 'posts', parentId, 'comments', commentId);
    }
    const likeIncrement = isLiked ? increment(-1) : increment(1);
    return updateDocumentNonBlocking(commentRef, {
        likes: likeIncrement
    });
}

/**
 * Toggles a like on a reply.
 */
export function toggleLikeReply(firestore: Firestore, basePath: string, replyId: string, isLiked: boolean) {
    const replyRef = doc(firestore, basePath, 'replies', replyId);
    const likeIncrement = isLiked ? increment(-1) : increment(1);
    return updateDocumentNonBlocking(replyRef, {
        likes: likeIncrement
    });
}

/**
 * Deletes a post from Firestore.
 */
export function deletePost(firestore: Firestore, postId: string) {
    const postRef = doc(firestore, 'posts', postId);
    return deleteDocumentNonBlocking(postRef);
}

/**
 * Deletes a comment from Firestore and decrements the post's comment count.
 */
export function deleteComment(firestore: Firestore, postId: string, commentId: string) {
    const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);
    const postRef = doc(firestore, 'posts', postId);

    const batch = writeBatch(firestore);
    batch.delete(commentRef);
    batch.update(postRef, { comments: increment(-1) });

    batch.commit().catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `batch delete on ${commentRef.path} and update on ${postRef.path}`,
            operation: 'write',
          })
        );
    });
}

/**
 * Deletes a reply from Firestore.
 */
export function deleteReply(firestore: Firestore, postId: string, commentId: string, replyId: string) {
    const replyRef = doc(firestore, 'posts', postId, 'comments', commentId, 'replies', replyId);
    return deleteDocumentNonBlocking(replyRef);
}


/**
 * Publishes a new article to the 'news' collection or updates an existing one.
 */
export function publishArticle(firestore: Firestore, article: { title: string; content: string }, user: User, articleId?: string) {
  const articlesCollection = collection(firestore, 'news');
  
  if (articleId) {
    // We are updating an existing article
    const articleRef = doc(firestore, 'news', articleId);
    return updateDocumentNonBlocking(articleRef, {
      title: article.title,
      content: article.content,
      // You might want to add an 'updatedAt' field as well
    });
  } else {
    // We are creating a new article
    const articleData = {
      title: article.title,
      content: article.content,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous User',
      authorImage: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      createdAt: serverTimestamp(),
      category: 'Technology', // Placeholder, consider making this editable
      readTime: `${Math.ceil(JSON.stringify(article.content).length / 1500)} min read`,
    };
    return addDocumentNonBlocking(articlesCollection, articleData);
  }
}
