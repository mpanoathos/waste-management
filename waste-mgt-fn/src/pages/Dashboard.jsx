import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [binData, setBinData] = useState([]);

  useEffect(() => {
    // fetch bin fill level data from backend (mock for now)
    setBinData([
      { id: 'Bin 1', level: 75 },
      { id: 'Bin 2', level: 40 },
    ]);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Bin Status</h2>
      <div className="grid grid-cols-2 gap-4">
        {binData.map(bin => (
          <div key={bin.id} className="bg-white shadow p-4 rounded-xl">
            <h3 className="font-bold">{bin.id}</h3>
            <p>Fill Level: {bin.level}%</p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{ width: `${bin.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
