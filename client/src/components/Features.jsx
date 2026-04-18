import React from 'react';
import { Users, CalendarDays, Bell, CreditCard, LayoutDashboard, AlertCircle } from 'lucide-react';
import FeatureCard from './FeatureCard';

const featuresData = [
  {
    icon: Users,
    title: "Client Management",
    description: "Easily add, edit, and organize all your gym members in one secure database."
  },
  {
    icon: CalendarDays,
    title: "Membership Tracking",
    description: "Monitor start dates, end dates, and days remaining for every subscription."
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description: "Send automated alerts to clients before their plans expire."
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description: "Log transactions and keep a comprehensive history of all client payments."
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Overview",
    description: "Get real-time insights on active members, expiring accounts, and total revenue."
  },
  {
    icon: AlertCircle,
    title: "Red Tag System",
    description: "Automatically flag and track problematic or unpaid accounts seamlessly."
  }
];

const Features = () => {
  return (
    <section className="bg-gray-50 py-24 px-4 md:px-8 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to successfully run and scale your fitness business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, idx) => (
            <FeatureCard 
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
