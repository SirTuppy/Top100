import React, { useState } from 'react';
import { migrateBouldersToRealtimeDB } from '../utils/migrateData';

function DataMigration() {
  const [migrationStatus, setMigrationStatus] = useState('');

  const handleMigration = async () => {
    setMigrationStatus('Migration in progress...');
    try {
      await migrateBouldersToRealtimeDB();
      setMigrationStatus('Migration completed successfully!');
    } catch (error) {
      setMigrationStatus('Migration failed. Check console for details.');
      console.error('Migration error:', error);
    }
  };

  return (
    <div>
      <h2>Data Migration</h2>
      <button onClick={handleMigration}>Migrate Data to Realtime Database</button>
      <p>{migrationStatus}</p>
    </div>
  );
}

export default DataMigration;