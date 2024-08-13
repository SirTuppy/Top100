import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicLists } from '../firebase';
import { toast } from 'react-toastify';
import './PublicLists.css';

function PublicLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicLists = async () => {
      try {
        const publicLists = await getPublicLists();
        setLists(publicLists);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching public lists:', error);
        setError('Failed to load public lists. Please try again.');
        toast.error('Failed to load public lists. Please try again.');
        setLoading(false);
      }
    };

    fetchPublicLists();
  }, []);

  if (loading) {
    return <div>Loading public lists...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="public-lists-container">
      <h2>Public Lists</h2>
      {lists.length === 0 ? (
        <p>No public lists found.</p>
      ) : (
        <ul className="lists-grid">
          {lists.map(list => (
            <li key={list.id} className="list-item">
              <h3>{list.title}</h3>
              <p>{list.description}</p>
              <p>Created by: {list.userId}</p>
              <Link to={`/list/${list.id}`} className="view-list-button">View List</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PublicLists;