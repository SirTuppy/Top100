import React, { useState } from 'react';

function BoulderForm({ boulder, onSubmit }) {
  const [formData, setFormData] = useState({
    name: boulder?.name || '',
    grade: boulder?.grade || '',
    location: boulder?.location || '',
    description: boulder?.description || '',
    rock: boulder?.rock || '',
    line: boulder?.line || '',
    start: boulder?.start || '',
    height: boulder?.height || '',
    landing: boulder?.landing || '',
  });

  const [errors, setErrors] = useState({});

  const validateGrade = (grade) => {
    const gradeRegex = /^V(1[0-7]|[0-9])$/;
    return gradeRegex.test(grade);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate grade
    if (!validateGrade(formData.grade)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        grade: "Please enter a valid grade format (V0 to V17)",
      }));
      return;
    }

    // Pass the formData to the onSubmit function
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="boulder-form">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="grade">Grade:</label>
        <input
          type="text"
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleInputChange}
          required
          className={errors.grade ? 'invalid' : ''}
        />
        {errors.grade && <div className="error-message">{errors.grade}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="rock">Rock Quality:</label>
        <select
          id="rock"
          name="rock"
          value={formData.rock}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Rock Quality</option>
          <option value="Great">Great</option>
          <option value="Not great">Not great</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="line">Line:</label>
        <select
          id="line"
          name="line"
          value={formData.line}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Line Type</option>
          <option value="Uncontrived">Uncontrived</option>
          <option value="Contrived">Contrived</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="start">Start:</label>
        <select
          id="start"
          name="start"
          value={formData.start}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Start Type</option>
          <option value="Obvious">Obvious</option>
          <option value="Not obvious">Not obvious</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="height">Height:</label>
        <select
          id="height"
          name="height"
          value={formData.height}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Height</option>
          <option value="Tall">Tall</option>
          <option value="Not tall">Not tall</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="landing">Landing:</label>
        <select
          id="landing"
          name="landing"
          value={formData.landing}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Landing Type</option>
          <option value="Flat">Flat</option>
          <option value="Not flat">Not flat</option>
        </select>
      </div>

      <button type="submit" className="submit-button">
        {boulder ? 'Update Boulder' : 'Add Boulder'}
      </button>
    </form>
  );
}

export default BoulderForm;