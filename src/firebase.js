import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, push, get, remove } from 'firebase/database';
import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaFDwJyA6ogrFzLLCVonaPHev6nvGsVkc",
  authDomain: "top100boulders.firebaseapp.com",
  projectId: "top100boulders",
  storageBucket: "top100boulders.appspot.com",
  messagingSenderId: "560590099613",
  appId: "1:560590099613:web:34473af3cb298145e5f074",
  measurementId: "G-89V60824K8",
  databaseURL: "https://top100boulders-default-rtdb.firebaseio.com" // Make sure this is your actual Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);

// Reference to the 'boulders' collection in Firestore
const BOULDERS_COLLECTION = 'boulders_import_20240811_140936';
export const bouldersCollection = collection(db, BOULDERS_COLLECTION);

// Helper functions for user lists
export const createUserList = async (userId, listData) => {
  const userListsRef = ref(database, `userLists/${userId}`);
  const newListRef = push(userListsRef);
  const listId = newListRef.key;
  
  await set(newListRef, {
    ...listData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  if (listData.isPublic) {
    const publicListRef = ref(database, `publicLists/${listId}`);
    await set(publicListRef, {
      ...listData,
      userId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  return listId;
};

export const getUserLists = async (userId) => {
  const userListsRef = ref(database, `userLists/${userId}`);
  const snapshot = await get(userListsRef);
  if (snapshot.exists()) {
    const lists = [];
    snapshot.forEach((childSnapshot) => {
      lists.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    return lists;
  }
  return [];
};

export const getPublicLists = async () => {
  const publicListsRef = ref(database, 'publicLists');
  const snapshot = await get(publicListsRef);
  if (snapshot.exists()) {
    const lists = [];
    snapshot.forEach((childSnapshot) => {
      lists.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    return lists;
  }
  return [];
};

export const updateUserList = async (userId, listId, updatedData) => {
  const listRef = ref(database, `userLists/${userId}/${listId}`);
  await set(listRef, {
    ...updatedData,
    updatedAt: Date.now()
  });

  if (updatedData.isPublic) {
    const publicListRef = ref(database, `publicLists/${listId}`);
    await set(publicListRef, {
      ...updatedData,
      userId: userId,
      updatedAt: Date.now()
    });
  } else {
    // If the list is no longer public, remove it from publicLists
    const publicListRef = ref(database, `publicLists/${listId}`);
    await remove(publicListRef);
  }
};

export const deleteUserList = async (userId, listId) => {
  const listRef = ref(database, `userLists/${userId}/${listId}`);
  await remove(listRef);

  // Also remove from publicLists if it exists there
  const publicListRef = ref(database, `publicLists/${listId}`);
  await remove(publicListRef);
};