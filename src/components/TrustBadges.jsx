import React from 'react';
import { Star, Users, Target, BookOpen } from 'lucide-react';

const trustStats = [
  { icon: Star, value: '4.4★', label: 'Average Rating', subtext: 'Amazon Reviews' },
  { icon: Users, value: '350K+', label: 'Customers', subtext: 'Served Since 2020' },
  { icon: Target, value: '70%', label: 'Effective', subtext: 'UCLA Research' },
  { icon: BookOpen, value: '11', label: 'Clinical Studies', subtext: 'Peer-Reviewed' }
];

export default function TrustBadges() {
  return (
    <section className="py-6 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {trustStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <stat.icon className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
