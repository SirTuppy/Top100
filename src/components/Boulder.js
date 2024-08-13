import React, { useState, useMemo } from 'react';
import { auth, database } from '../firebase';
import { ref, push } from 'firebase/database';
import AddToListButton from './AddToListButton';
import './Boulder.css';

const Boulder = ({ boulder, isInUserList }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGradeClass = useMemo(() => {
    if (!boulder || !boulder.grade) return '';
    const numericGrade = parseInt(boulder.grade.replace('V', ''));
    return numericGrade > 10 ? `grade-v${numericGrade}` : '';
  }, [boulder]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const addToUserList = async () => {
    if (!auth.currentUser) {
      alert('Please log in to add boulders to your list');
      return;
    }

    try {
      const userBouldersRef = ref(database, `userBoulders/${auth.currentUser.uid}`);
      await push(userBouldersRef, boulder.id);
      alert('Boulder added to your list!');
    } catch (error) {
      console.error('Error adding boulder to user list:', error);
      alert('Failed to add boulder to your list. Please try again.');
    }
  };

  if (!boulder || !boulder.name) {
    console.error('Invalid boulder data:', boulder);
    return null;
  }

  return (
    <div className={`boulder-container ${getGradeClass} ${isExpanded ? 'expanded' : ''}`}>
      <div className="boulder" onClick={toggleExpand}>
        <span className="rank">{boulder.rank}. </span>
        <div className="name-grade-container">
          <span className="name">{boulder.name}</span>
          <span className="grade">{boulder.grade}</span>
        </div>
        <span className="location">{boulder.location}</span>
      </div>
      {isExpanded && (
        <div className="boulder-details">
          <p><strong>RockQuality:</strong> {boulder.rock}</p>
          <p><strong>Line:</strong> {boulder.line}</p>
          <p><strong>Start:</strong> {boulder.start}</p>
          <p><strong>Height:</strong> {boulder.height}</p>
          <p><strong>Landing:</strong> {boulder.landing}</p>
          <p><strong>Description:</strong> {boulder.description}</p>
          {boulder.videoUrl && (
            <iframe
              width="560"
              height="315"
              src={boulder.videoUrl}
              title={`${boulder.name} video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          <AddToListButton boulder={boulder} />
        </div>
      )}
    </div>
  );
};

export default Boulder;