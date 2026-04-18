import React from 'react';
import { Mail } from 'lucide-react';

const Contact = () => {
  return (
    <section className="bg-gray-50 py-24 px-4 md:px-8 border-t border-gray-100">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Have questions? Contact us</h2>
        <p className="text-gray-600 mb-10 text-lg">We're here to help you get started with GymFlow.</p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-gray-800">
          <a href="mailto:gymflow.support@gmail.com" className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100">
            <Mail className="text-gray-700" size={24} />
            <span className="font-medium text-lg">gymflow.support@gmail.com</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
