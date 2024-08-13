import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, getUserLists, deleteUserList } from '../firebase';
import { toast } from 'react-toastify';
import './MyLists.css';

function MyLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const userLists = await getUserLists(auth.currentUser.uid);
        setLists(userLists);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lists:', error);
        toast.error('Failed to load your lists. Please try again.');
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteUserList(auth.currentUser.uid, listId);
        setLists(lists.filter(list => list.id !== listId));
        toast.success('List deleted successfully');
      } catch (error) {
        console.error('Error deleting list:', error);
        toast.error('Failed to delete the list. Please try again.');
      }
    }
  };

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const sortedLists = [...lists].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'boulderCount':
        comparison = (a.boulders?.length || 0) - (b.boulders?.length || 0);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-lists-container">
      <h2>My Lists</h2>
      <Link to="/create-list" className="create-list-button">Create New List</Link>
      <div className="sort-options">
        <button onClick={() => handleSort('title')}>Sort by Title</button>
        <button onClick={() => handleSort('createdAt')}>Sort by Date Created</button>
        <button onClick={() => handleSort('boulderCount')}>Sort by Number of Boulders</button>
      </div>
      {sortedLists.length === 0 ? (
        <p>You haven't created any lists yet.</p>
      ) : (
        <ul className="lists-grid">
          {sortedLists.map(list => (
            <li key={list.id} className="list-item">
              <h3>{list.title}</h3>
              <p>{list.description}</p>
              <p>Boulders: {list.boulders ? list.boulders.length : 0}</p>
              <p>{list.isPublic ? 'Public' : 'Private'}</p>
              <p>Created: {new Date(list.createdAt).toLocaleDateString()}</p>
              <div className="list-actions">
                <Link to={`/list/${list.id}`} className="view-button">View</Link>
                <Link to={`/edit-list/${list.id}`} className="edit-button">Edit</Link>
                <button onClick={() => handleDeleteList(list.id)} className="delete-button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyLists;