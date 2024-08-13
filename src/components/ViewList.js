import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';
import { toast } from 'react-toastify';
import './ViewList.css';

function ViewList() {
  const [list, setList] = useState(null);
  const [boulders, setBoulders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { listId } = useParams();

  useEffect(() => {
    const fetchListAndBoulders = async () => {
      try {
        // Try to fetch from userLists first
        let listRef = ref(database, `userLists/${auth.currentUser?.uid}/${listId}`);
        let listSnapshot = await get(listRef);

        // If not found in userLists, try publicLists
        if (!listSnapshot.exists()) {
          listRef = ref(database, `publicLists/${listId}`);
          listSnapshot = await get(listRef);
        }

        if (listSnapshot.exists()) {
          const listData = listSnapshot.val();
          setList({ id: listSnapshot.key, ...listData });

          // Fetch boulders for the list
          const bouldersRef = ref(database, `boulders`);
          const bouldersSnapshot = await get(bouldersRef);
          if (bouldersSnapshot.exists()) {
            const allBoulders = bouldersSnapshot.val();
            const listBoulders = listData.boulders || {};
            const filteredBoulders = Object.keys(listBoulders)
              .map(key => ({ id: key, ...allBoulders[key], ...listBoulders[key] }))
              .filter(boulder => boulder.name); // Ensure the boulder exists in the main list
            setBoulders(filteredBoulders);
          }
        } else {
          setError('List not found');
        }
      } catch (error) {
        console.error('Error fetching list and boulders:', error);
        setError('Failed to load the list. Please try again.');
        toast.error('Failed to load the list. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListAndBoulders();
  }, [listId]);

  if (loading) {
    return <div>Loading list...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!list) {
    return <div>List not found</div>;
  }

  return (
    <div className="view-list-container">
      <h2>{list.title}</h2>
      <p>{list.description}</p>
      <ul className="boulder-list">
        {boulders.map(boulder => (
          <li key={boulder.id} className="boulder-item">
            <h3>{boulder.name}</h3>
            <p>Grade: {boulder.grade}</p>
            <p>Location: {boulder.location}</p>
            {boulder.notes && <p>Notes: {boulder.notes}</p>}
            {boulder.completed && <p>Completed: ✅</p>}
          </li>
        ))}
      </ul>
      <Link to="/my-lists" className="back-button">Back to My Lists</Link>
    </div>
  );
}

export default ViewList;