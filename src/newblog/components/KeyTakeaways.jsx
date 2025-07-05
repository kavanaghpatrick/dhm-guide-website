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
      className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="p-2 bg-green-600 rounded-lg"
        >
          <Zap className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900">Key Takeaways</h3>
      </div>
      
      <ul className="space-y-3">
        {takeaways.map((takeaway, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 leading-relaxed">{takeaway}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default KeyTakeaways;