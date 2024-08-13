import React from 'react';
import { bouldersCollection } from '../firebase';

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function BoulderDetails({ boulderId }) {
  const [boulder, setBoulder] = useState(null);

  useEffect(() => {
    const fetchBoulder = async () => {
      const boulderRef = doc(bouldersCollection, boulderId);
      const boulderSnap = await getDoc(boulderRef);
      if (boulderSnap.exists()) {
        setBoulder({ id: boulderSnap.id, ...boulderSnap.data() });
      }
    };

    fetchBoulder();
  }, [boulderId]);

  return (
    <div className="boulder-details">
      {boulder && (
        <>
          <h2>{escapeHtml(boulder.name)}</h2>
          <p>Grade: {escapeHtml(boulder.grade)}</p>
          <p>Location: {escapeHtml(boulder.location)}</p>
          <p>Description: {escapeHtml(boulder.description)}</p>
          {boulder.videoUrl && (
            <iframe
              width="560"
              height="315"
              src={escapeHtml(boulder.videoUrl)}
              title={`${escapeHtml(boulder.name)} video`}
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          <button onClick={onClose}>Close</button>
        </>
      )}
    </div>
  );
}

export default BoulderDetails;