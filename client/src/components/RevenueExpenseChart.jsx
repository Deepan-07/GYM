import React from 'react';

const RevenueExpenseChart = ({ data }) => {
  // Use data or fallback to empty array
  const chartData = data || [];
  
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-900/20 rounded-xl border border-gray-800 border-dashed">
        <p className="text-gray-500">No financial data available for the last 6 months.</p>
      </div>
    );
  }

  // Find max value to scale the bars
  const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.expenses)), 1000);

  return (
    <div className="w-full h-[400px] mt-4 flex flex-col">
      <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-8 border-b border-gray-800">
        {chartData.map((monthData, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group relative">
            <div className="w-full flex justify-center gap-1 items-end h-[300px]">
              {/* Revenue Bar */}
              <div 
                className="w-1/3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 relative group/bar"
                style={{ height: `${(monthData.revenue / maxVal) * 100}%`, minHeight: monthData.revenue > 0 ? '4px' : '0' }}
              >
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded border border-gray-700 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  Revenue: ₹{monthData.revenue.toLocaleString()}
                </div>
              </div>
              
              {/* Expenses Bar */}
              <div 
                className="w-1/3 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 relative group/bar"
                style={{ height: `${(monthData.expenses / maxVal) * 100}%`, minHeight: monthData.expenses > 0 ? '4px' : '0' }}
              >
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded border border-gray-700 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  Expenses: ₹{monthData.expenses.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Label */}
            <span className="mt-4 text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
              {monthData.month}
            </span>

            {/* Hover Indicator Background */}
            <div className="absolute inset-0 -mx-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-xs font-bold text-gray-400">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
          <span className="text-xs font-bold text-gray-400">Expenses</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueExpenseChart;
