import React from 'react';
import { Bus } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-red-600" />
            <span className="font-bold text-gray-900">MeriYatra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
