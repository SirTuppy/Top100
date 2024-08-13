import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, createUserList, getUserLists, updateUserList, database } from '../firebase';
import { toast } from 'react-toastify';
import { ref, get } from 'firebase/database';
import './CreateList.css';

function CreateList() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [boulders, setBoulders] = useState([]);
  const [allBoulders, setAllBoulders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { listId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      if (listId) {
        const userLists = await getUserLists(auth.currentUser.uid);
        const currentList = userLists.find(list => list.id === listId);
        if (currentList) {
          setTitle(currentList.title);
          setDescription(currentList.description);
          setIsPublic(currentList.isPublic);
          setBoulders(currentList.boulders || []);
        }
      }

      // Fetch all boulders
      const bouldersRef = ref(database, 'boulders');
      const snapshot = await get(bouldersRef);
      if (snapshot.exists()) {
        const bouldersData = snapshot.val();
        const bouldersList = Object.entries(bouldersData).map(([id, data]) => ({
          id,
          ...data
        }));
        setAllBoulders(bouldersList);
      }
    };

    fetchData();
  }, [listId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title for your list.');
      return;
    }

    const listData = {
      title,
      description,
      isPublic,
      boulders: boulders.map(boulder => boulder.id)
    };

    try {
      if (listId) {
        await updateUserList(auth.currentUser.uid, listId, listData);
        toast.success('List updated successfully!');
      } else {
        await createUserList(auth.currentUser.uid, listData);
        toast.success('List created successfully!');
      }
      navigate('/my-lists');
    } catch (error) {
      console.error('Error saving list:', error);
      toast.error('An error occurred while saving the list. Please try again.');
    }
  };

  const addBoulder = (boulder) => {
    if (!boulders.some(b => b.id === boulder.id)) {
      setBoulders([...boulders, boulder]);
    }
  };

  const removeBoulder = (boulderId) => {
    setBoulders(boulders.filter(b => b.id !== boulderId));
  };

  const filteredBoulders = allBoulders.filter(boulder =>
    boulder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="create-list-container">
      <h2>{listId ? 'Edit List' : 'Create New List'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make this list public
          </label>
        </div>
        <div>
          <h3>Boulders in this list:</h3>
          <ul>
            {boulders.map(boulder => (
              <li key={boulder.id}>
                {boulder.name} - {boulder.grade}
                <button type="button" onClick={() => removeBoulder(boulder.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Add boulders:</h3>
          <input
            type="text"
            placeholder="Search boulders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul>
            {filteredBoulders.map(boulder => (
              <li key={boulder.id}>
                {boulder.name} - {boulder.grade}
                <button type="button" onClick={() => addBoulder(boulder)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit">{listId ? 'Update List' : 'Create List'}</button>
      </form>
    </div>
  );
}

export default CreateList;