import React from 'react';
import { CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const KeyTakeaways = ({ takeaways }) => {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="not-prose card"
      style={{
        backgroundColor: 'var(--color-brand-soft)',
        borderLeft: '3px solid var(--color-brand)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{
            display: 'inline-flex',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-brand)',
          }}
        >
          <Zap className="w-5 h-5" style={{ color: 'var(--color-on-brand)' }} aria-hidden="true" />
        </motion.div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-ink)', margin: 0 }}>
          Key Takeaways
        </h3>
      </div>

      <ul className="space-y-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {takeaways.map((takeaway, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-brand)' }} aria-hidden="true" />
            <span style={{ color: 'var(--color-ink)', lineHeight: 1.6 }}>{takeaway}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default KeyTakeaways;