import React, { useState, useEffect } from 'react';
import { ref, push, get, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import { database } from '../firebase';
import BoulderForm from './BoulderForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AddBoulder.css';

function AddBoulder() {
  const navigate = useNavigate();
  const [existingBoulders, setExistingBoulders] = useState([]);

  useEffect(() => {
    const fetchExistingBoulders = async () => {
      const bouldersRef = ref(database, 'boulders');
      const snapshot = await get(bouldersRef);
      if (snapshot.exists()) {
        const boulders = Object.values(snapshot.val());
        setExistingBoulders(boulders);
      }
    };

    fetchExistingBoulders();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      // Check if boulder already exists
      const boulderExists = existingBoulders.some(
        boulder => boulder.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (boulderExists) {
        toast.error('Boulder already exists!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Get the current highest rank
      const bouldersRef = ref(database, 'boulders');
      const rankQuery = query(bouldersRef, orderByChild('rank'), limitToLast(1));
      const rankSnapshot = await get(rankQuery);
      
      let newRank = 1;
      if (rankSnapshot.exists()) {
        const highestRankedBoulder = Object.values(rankSnapshot.val())[0];
        newRank = highestRankedBoulder.rank + 1;
      }

      // Add the new boulder with a rank
      await push(bouldersRef, { ...formData, rank: newRank });
      
      // Show success message
      toast.success('Boulder added successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to main list after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500); // Delay for 1.5 seconds so the user can see the success message

    } catch (error) {
      console.error("Error adding boulder:", error);
      // Show error message
      toast.error('Error adding boulder. Please try again.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="add-boulder-container">
      <h2 className="add-boulder-title">Add New Boulder</h2>
      <BoulderForm onSubmit={handleSubmit} />
    </div>
  );
}

export default AddBoulder;