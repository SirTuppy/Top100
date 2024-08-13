import React, { useState, useEffect, useContext } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase';
import Boulder from './Boulder';
import { ThemeContext } from '../ThemeContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaFilter } from 'react-icons/fa';
import './MainList.css';
import './Boulder.css';

function MainList() {
  const [boulders, setBoulders] = useState([]);
  const [filteredBoulders, setFilteredBoulders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeRange, setGradeRange] = useState([10, 17]);
  const [stateFilter, setStateFilter] = useState('');
  const [rockQuality, setrockQuality] = useState('');
  const [line, setLine] = useState('');
  const [start, setStart] = useState('');
  const [height, setHeight] = useState('');
  const [landing, setLanding] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const bouldersRef = ref(database, 'boulders');
    const unsubscribe = onValue(bouldersRef, (snapshot) => {
      if (snapshot.exists()) {
        const bouldersData = snapshot.val();
        const bouldersList = Object.entries(bouldersData)
          .map(([id, data]) => ({ id, ...data }))
          .filter(boulder => boulder.name && boulder.grade)
          .sort((a, b) => (a.rank || 0) - (b.rank || 0));

        setBoulders(bouldersList);
        setFilteredBoulders(bouldersList);
      } else {
        setBoulders([]);
        setFilteredBoulders([]);
      }
      setLoading(false);
    }, (error) => {
      setError("Error loading boulders. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = boulders.filter(boulder => {
      const matchesSearch = boulder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            boulder.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            boulder.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = parseInt(boulder.grade.replace('V', '')) >= gradeRange[0] &&
                           parseInt(boulder.grade.replace('V', '')) <= gradeRange[1];
      const matchesState = stateFilter === '' || boulder.location.toLowerCase().includes(stateFilter.toLowerCase());
      const matchesrockQuality = rockQuality === '' || boulder.rock === rockQuality;
      const matchesLine = line === '' || boulder.line === line;
      const matchesStart = start === '' || boulder.start === start;
      const matchesHeight = height === '' || boulder.height === height;
      const matchesLanding = landing === '' || boulder.landing === landing;

      return matchesSearch && matchesGrade && matchesState && matchesrockQuality && matchesLine && matchesStart && matchesHeight && matchesLanding;
    });
    setFilteredBoulders(filtered);
  }, [searchTerm, gradeRange, stateFilter, rockQuality, line, start, height, landing, boulders]);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(filteredBoulders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update ranks
    const updatedItems = items.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    setFilteredBoulders(updatedItems);

    // Update all boulders with new ranks
    const allUpdatedBoulders = boulders.map(boulder => {
      const updatedBoulder = updatedItems.find(item => item.id === boulder.id);
      return updatedBoulder || boulder;
    });

    setBoulders(allUpdatedBoulders);

    // Update database
    const updates = {};
    allUpdatedBoulders.forEach((boulder) => {
      updates[`boulders/${boulder.id}/rank`] = boulder.rank;
    });
    update(ref(database), updates);
  };

  const resetFilters = () => {
    setGradeRange([10, 17]);
    setStateFilter('');
    setrockQuality('');
    setLine('');
    setStart('');
    setHeight('');
    setLanding('');
  };

  const handleGradeChange = (index, value) => {
    const newGradeRange = [...gradeRange];
    newGradeRange[index] = parseInt(value);
    if (index === 0 && newGradeRange[0] > newGradeRange[1]) {
      newGradeRange[1] = newGradeRange[0];
    } else if (index === 1 && newGradeRange[1] < newGradeRange[0]) {
      newGradeRange[0] = newGradeRange[1];
    }
    setGradeRange(newGradeRange);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`main-list-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="boulder-count">
        Number of boulders: {filteredBoulders.length}
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search boulders by name, grade, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
        <FaFilter /> Filters
      </button>
      {showFilters && (
        <div className="filter-container">
          <label>
            Grade Range: V{gradeRange[0]} - V{gradeRange[1]}
            <div className="grade-slider-container">
              <div className="grade-slider-track"></div>
              <input
                type="range"
                min="10"
                max="17"
                value={gradeRange[0]}
                onChange={(e) => handleGradeChange(0, e.target.value)}
                className="grade-slider grade-slider-min"
              />
              <input
                type="range"
                min="10"
                max="17"
                value={gradeRange[1]}
                onChange={(e) => handleGradeChange(1, e.target.value)}
                className="grade-slider grade-slider-max"
              />
            </div>
          </label>
          <label>
            Location:
            <input
              type="text"
              placeholder="Enter crag, city, or state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            />
          </label>
          <label>
            Rock Quality:
            <select value={rockQuality} onChange={(e) => setrockQuality(e.target.value)}>
              <option value="">All</option>
              <option value="Great">Great</option>
              <option value="Not great">Not Great</option>
            </select>
          </label>
          <label>
            Line:
            <select value={line} onChange={(e) => setLine(e.target.value)}>
              <option value="">All</option>
              <option value="Contrived">Contrived</option>
              <option value="Uncontrived">Uncontrived</option>
            </select>
          </label>
          <label>
            Start:
            <select value={start} onChange={(e) => setStart(e.target.value)}>
              <option value="">All</option>
              <option value="Obvious">Obvious</option>
              <option value="Not obvious">Not Obvious</option>
            </select>
          </label>
          <label>
            Height:
            <select value={height} onChange={(e) => setHeight(e.target.value)}>
              <option value="">All</option>
              <option value="Tall">Tall</option>
              <option value="Not tall">Not Tall</option>
            </select>
          </label>
          <label>
            Landing:
            <select value={landing} onChange={(e) => setLanding(e.target.value)}>
              <option value="">All</option>
              <option value="Flat">Flat</option>
              <option value="Not flat">Not Flat</option>
            </select>
          </label>
          <button className="reset-filters-button" onClick={resetFilters}>Reset Filters</button>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="boulders">
          {(provided) => (
            <ul className="boulder-list" {...provided.droppableProps} ref={provided.innerRef}>
              {filteredBoulders.map((boulder, index) => (
                <Draggable key={boulder.id} draggableId={boulder.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Boulder boulder={boulder} />
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default MainList;