import React from 'react';

// O componente agora recebe as props isAuthenticated e onLogout
function Header({ isAuthenticated, onLogout }) {
  return (
    <header className="bg-white shadow-md p-4 mb-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciador de Leilões</h1>
        {/* Renderiza o botão de Sair se o usuário estiver autenticado */}
        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;