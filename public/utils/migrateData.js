import { getDocs } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { bouldersCollection, bouldersRef } from '../firebase';

export async function migrateBouldersToRealtimeDB() {
  try {
    const snapshot = await getDocs(bouldersCollection);
    
    const boulders = {};
    snapshot.forEach(doc => {
      boulders[doc.id] = doc.data();
    });

    await set(bouldersRef, boulders);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error migrating data:', error);
  }
}