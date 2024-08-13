const admin = require('firebase-admin');
const serviceAccount = require('./top100boulders-firebase-adminsdk-6ztf4-ae5bdafc12.json');
const data = require('./db.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const importData = async () => {
  try {
    for (const boulder of data.boulders) {
      await db.collection('boulders').doc(boulder.id.toString()).set(boulder);
      console.log(`Imported boulder: ${boulder.name}`);
    }
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

importData();