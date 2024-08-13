import React, { useState, useEffect } from 'react';
import { auth, getUserLists, updateUserList } from '../firebase';
import { toast } from 'react-toastify';
import './AddToListButton.css';

function AddToListButton({ boulder }) {
  const [userLists, setUserLists] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUserLists = async () => {
      if (auth.currentUser) {
        const lists = await getUserLists(auth.currentUser.uid);
        setUserLists(lists);
      }
    };
    fetchUserLists();
  }, []);

  const addToList = async (listId) => {
    try {
      const list = userLists.find(l => l.id === listId);
      const updatedBoulders = [...(list.boulders || []), boulder.id];
      await updateUserList(auth.currentUser.uid, listId, { ...list, boulders: updatedBoulders });
      toast.success(`Added ${boulder.name} to ${list.title}`);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding boulder to list:', error);
      toast.error('Failed to add boulder to list. Please try again.');
    }
  };

  if (!auth.currentUser) {
    return null;
  }

  return (
    <div className="add-to-list-container">
      <button onClick={() => setShowDropdown(!showDropdown)}>Add to List</button>
      {showDropdown && (
        <ul className="list-dropdown">
          {userLists.map(list => (
            <li key={list.id} onClick={() => addToList(list.id)}>{list.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddToListButton;