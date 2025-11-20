

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
 * Adds a new comment to a post's 'comments' subcollection in Firestore.
 */
export function addComment(firestore: Firestore, postId: string, commentText: string, user: User) {
    const commentsCollection = collection(firestore, 'posts', postId, 'comments');
    const postRef = doc(firestore, 'posts', postId);

    const authorData = {
        name: user.displayName || 'Anonymous User',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        uid: user.uid,
    };

    const commentData = {
        author: authorData,
        content: commentText,
        likes: 0,
        createdAt: serverTimestamp(),
    };

    const batch = writeBatch(firestore);
    
    // Add new comment
    const newCommentRef = doc(commentsCollection); // Create a new doc ref for the comment
    batch.set(newCommentRef, commentData);
    
    // Update comment count on post
    batch.update(postRef, { comments: increment(1) });
    
    // Non-blocking commit
    batch.commit().catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `batch write to ${postRef.path} and ${newCommentRef.path}`,
            operation: 'write',
            requestResourceData: { postUpdate: { comments: 'increment' }, newComment: commentData },
          })
        );
    });
}


/**
 * Adds a new reply to a comment's 'replies' subcollection in Firestore.
 */
export function addReply(firestore: Firestore, postId: string, commentId: string, replyText: string, user: User) {
  const repliesCollection = collection(firestore, 'posts', postId, 'comments', commentId, 'replies');
  
  const authorData = {
    name: user.displayName || 'Anonymous User',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    uid: user.uid,
  };

  return addDocumentNonBlocking(repliesCollection, {
    author: authorData,
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
export function toggleLikeComment(firestore: Firestore, postId: string, commentId: string, isLiked: boolean) {
    const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);
    const likeIncrement = isLiked ? increment(-1) : increment(1);
    return updateDocumentNonBlocking(commentRef, {
        likes: likeIncrement
    });
}

/**
 * Toggles a like on a reply.
 */
export function toggleLikeReply(firestore: Firestore, postId: string, commentId: string, replyId: string, isLiked: boolean) {
    const replyRef = doc(firestore, 'posts', postId, 'comments', commentId, 'replies', replyId);
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
 * Publishes a new article to the 'articles' collection.
 */
export function publishArticle(firestore: Firestore, article: { title: string; content: string }, user: User) {
  const articlesCollection = collection(firestore, 'articles');
  
  const articleData = {
    title: article.title,
    content: article.content,
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous User',
    authorImage: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    createdAt: serverTimestamp(),
    // These are placeholders, a real implementation might calculate them
    category: 'Technology',
    readTime: `${Math.ceil(JSON.stringify(article.content).length / 1500)} min read`,
  };

  return addDocumentNonBlocking(articlesCollection, articleData);
}

    