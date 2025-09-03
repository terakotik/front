import React from 'react';

type TerminalProps = {
  title: string;
  children: React.ReactNode;
};

const Terminal: React.FC<TerminalProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-700 border-2 border-gray-500 rounded-lg shadow-lg w-full max-w-2xl mx-auto my-4 font-mono overflow-hidden">
      <div className="bg-blue-800 text-white px-4 py-1 flex justify-between items-center rounded-t-lg border-b-2 border-gray-500">
        <h2 className="text-sm font-bold">{title}</h2>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>
      <div className="p-4 bg-black text-green-400 text-sm overflow-y-auto h-64 relative crt">
        {children}
        <span className="animate-pulse">_</span>
      </div>
    </div>
  );
};

export default Terminal;
