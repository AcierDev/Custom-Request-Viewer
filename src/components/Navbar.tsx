"use client";

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center">
          <div className="select-none">
            <span className="text-xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-orange-700 via-gray-400 to-sky-700 bg-clip-text text-transparent drop-shadow-sm">
              EVERWOOD
            </span>
          </div>
          <div className="ml-auto" />
        </div>
      </div>
    </header>
  );
}
