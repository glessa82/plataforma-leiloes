import React from 'react';

function Header() {
  return (
    <header className="w-full bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <h1 className="text-xl font-bold">Gerenciador de Leilões</h1>
      </div>
    </header>
  );
}

export default Header;