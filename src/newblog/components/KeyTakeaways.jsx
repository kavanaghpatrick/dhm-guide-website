import React from 'react';

// Quiet summary block above the post body (styled by .post-takeaways in
// theme-modern.css section 16). The label is a paragraph, not a heading, so the
// article outline stays h1 → body h2 → h3; no entrance motion.
const KeyTakeaways = ({ takeaways }) => {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <div className="not-prose post-takeaways">
      <p className="post-block-label">Key takeaways</p>
      <ul>
        {takeaways.map((takeaway, index) => (
          <li key={index}>{takeaway}</li>
        ))}
      </ul>
    </div>
  );
};

export default KeyTakeaways;
