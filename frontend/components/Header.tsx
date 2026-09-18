import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8 px-4 max-w-4xl mx-auto">
      <div className="inline-flex items-center justify-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-4 border border-amber-500/20">
        <span>☀</span>
        <span>Astronomical Route Shade Optimization</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
        Window-Side Navigator
      </h1>
      <p className="mt-3 text-xl sm:text-2xl font-semibold text-amber-600">
        Catch the shade. Skip the glare.
      </p>
      <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
        Sit on the shady side of your bus or car by matching your route to the sun's path.
      </p>
    </header>
  );
};
