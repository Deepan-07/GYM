import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
