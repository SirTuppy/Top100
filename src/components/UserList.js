import React, { useState, useEffect } from 'react';
import { ref, onValue, push, remove, get } from 'firebase/database';
import { auth, database } from '../firebase';
import Boulder from './Boulder';
import { toast } from 'react-toastify';
import './UserList.css';

function UserList() {
  const [userBoulders, setUserBoulders] = useState([]);
  const [allBoulders, setAllBoulders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Add this function to remove duplicates
  const removeDuplicates = (boulders) => {
    const uniqueBoulders = [];
    const seenIds = new Set();
    
    for (const boulder of boulders) {
      if (!seenIds.has(boulder.id)) {
        seenIds.add(boulder.id);
        uniqueBoulders.push(boulder);
      }
    }
    
    return uniqueBoulders;
  };

  useEffect(() => {
    const bouldersRef = ref(database, 'boulders');
    const unsubscribeBoulders = onValue(bouldersRef, (snapshot) => {
      if (snapshot.exists()) {
        const bouldersData = snapshot.val();
        const bouldersList = Object.entries(bouldersData).map(([id, data]) => ({ id, ...data }));
        setAllBoulders(bouldersList);
        fetchUserBoulders(bouldersList);
      }
    });

    return () => unsubscribeBoulders();
  }, []);

  const fetchUserBoulders = (allBouldersList) => {
    if (auth.currentUser) {
      const userBouldersRef = ref(database, `userBoulders/${auth.currentUser.uid}`);
      onValue(userBouldersRef, (snapshot) => {
        if (snapshot.exists()) {
          const userBoulderIds = Object.values(snapshot.val());
          const userBoulderList = allBouldersList.filter(boulder => userBoulderIds.includes(boulder.id));
          setUserBoulders(removeDuplicates(userBoulderList)); // Use the new function here
        } else {
          setUserBoulders([]);
        }
      });
    }
  };

  useEffect(() => {
    console.log('Search term:', searchTerm);
    console.log('All boulders:', allBoulders);
    if (searchTerm.trim() === '') {
      setSearchResults([]);
    } else {
      const results = allBoulders.filter(boulder =>
        boulder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boulder.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boulder.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Filtered results:', results);
      setSearchResults(results);
    }
  }, [searchTerm, allBoulders]);

  const addToUserList = async (boulder) => {
    if (!auth.currentUser) {
      toast.error('Please log in to add boulders to your list');
      return;
    }

    try {
      const userBouldersRef = ref(database, `userBoulders/${auth.currentUser.uid}`);
      const snapshot = await get(userBouldersRef);
      const existingBoulders = snapshot.val() || {};
      
      // Check if boulder is already in the list
      if (Object.values(existingBoulders).includes(boulder.id)) {
        toast.info('This boulder is already in your list');
        return;
      }

      // Add the new boulder
      await push(userBouldersRef, boulder.id);
      toast.success('Boulder added to your list');
      fetchUserBoulders(allBoulders);
    } catch (error) {
      console.error('Error adding boulder:', error);
      toast.error('Failed to add boulder');
    }
  };

  const removeFromUserList = async (boulder) => {
    if (!auth.currentUser) {
      toast.error('Please log in to remove boulders from your list');
      return;
    }

    try {
      const userBouldersRef = ref(database, `userBoulders/${auth.currentUser.uid}`);
      const snapshot = await get(userBouldersRef);
      
      if (snapshot.exists()) {
        const userBoulders = snapshot.val();
        const entryToRemove = Object.entries(userBoulders).find(([key, value]) => value === boulder.id);
        
        if (entryToRemove) {
          const [key] = entryToRemove;
          await remove(ref(database, `userBoulders/${auth.currentUser.uid}/${key}`));
          toast.success('Boulder removed from your list');
          fetchUserBoulders(allBoulders);
        } else {
          toast.error('Boulder not found in your list');
        }
      } else {
        toast.error('No boulders found in your list');
      }
    } catch (error) {
      console.error('Error removing boulder:', error);
      toast.error('Failed to remove boulder');
    }
  };

  return (
    <div className="user-list-container">
      <h1>My Boulder List</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search boulders to add"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {searchTerm && (
        <div className="search-results">
          <h2>Search Results</h2>
          {searchResults.length > 0 ? (
            searchResults.map(boulder => (
              <div key={boulder.id} className="search-result-item">
                <Boulder boulder={boulder} isInUserList={userBoulders.some(ub => ub.id === boulder.id)} />
                {!userBoulders.some(ub => ub.id === boulder.id) && (
                  <button onClick={() => addToUserList(boulder)}>Add to My List</button>
                )}
              </div>
            ))
          ) : (
            <p>No boulders found matching your search.</p>
          )}
        </div>
      )}
      <h2>My Boulders</h2>
      {userBoulders.length === 0 ? (
        <p>You haven't added any boulders to your list yet.</p>
      ) : (
        removeDuplicates(userBoulders).map(boulder => ( // Use removeDuplicates here as well
          <div key={boulder.id} className="user-boulder-item">
            <Boulder boulder={boulder} isInUserList={true} />
            <button onClick={() => removeFromUserList(boulder)} className="remove-button">Remove from My List</button>
          </div>
        ))
      )}
    </div>
  );
}

export default UserList;