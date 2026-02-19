import React, { useState } from 'react';
import { ShoppingCart, User, Heart, Languages, Mic, Camera } from 'lucide-react';

/**
 * Custom CSS for specific design tokens and font loading.
 */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Poppins:wght@500;700&display=swap');

    :root {
      --variable-black: #1A1A1A;
      --gray-text: #6A717F;
    }

    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background-color: #ffffff;
    }

    button, input {
      appearance: none;
      background-color: transparent;
      border: 0;
      outline: none;
    }

    .search-pill-shadow {
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
    }
  `}</style>
);

/**
 * HeaderStyle6 component. 
 * Renamed to App for the preview environment, but also exported as HeaderStyle6.
 */
const HeaderStyle6 = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      <GlobalStyles />
      <header className="bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] w-full h-[112px] flex items-center relative z-50">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-8 lg:px-[100px]">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-white text-[44px] font-bold font-['Poppins'] tracking-tight leading-none cursor-pointer select-none">
              Logo
            </h1>
          </div>

          {/* Search Group */}
          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-[300px] md:w-[500px] lg:w-[671px] h-[52px] bg-white rounded-full flex items-center px-6 search-pill-shadow group transition-all"
            >
              {/* Microphone Icon */}
              <button type="button" className="text-[#1A1A1A] hover:text-orange-600 transition-colors flex items-center justify-center mr-3">
                <Mic size={22} strokeWidth={1.8} />
              </button>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in Cart and Get"
                className="flex-1 text-[#6A717F] text-base font-normal font-['Inter'] placeholder:text-[#6A717F] outline-none"
              />

              {/* Search Button */}
              <button
                type="submit"
                className="text-[#1A1A1A] font-medium text-base font-['Poppins'] hover:text-orange-600 transition-colors ml-4"
              >
                Search
              </button>
            </form>

            {/* Camera Visual Search Button */}
            <button
              type="button"
              className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center search-pill-shadow hover:bg-orange-50 transition-all active:scale-95 text-[#1A1A1A]"
              aria-label="Camera Search"
            >
              <Camera size={22} strokeWidth={1.8} />
            </button>
          </div>

          {/* Right Utility Navigation */}
          <div className="bg-white rounded-full h-[52px] px-7 flex items-center gap-7 search-pill-shadow">
            <button className="text-[#1A1A1A] hover:text-orange-600 transition-colors" aria-label="Language">
              <Languages size={22} strokeWidth={1.8} />
            </button>
            <button className="text-[#1A1A1A] hover:text-orange-600 transition-colors" aria-label="Favorites">
              <Heart size={22} strokeWidth={1.8} />
            </button>
            <button className="text-[#1A1A1A] hover:text-orange-600 transition-colors" aria-label="Cart">
              <ShoppingCart size={22} strokeWidth={1.8} />
            </button>
            <button className="text-[#1A1A1A] hover:text-orange-600 transition-colors" aria-label="Account">
              <User size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderStyle6;
