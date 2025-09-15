import React from 'react';

function Filters({ filters, onFilterChange, onSearch }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            city: '',
            status: '',
            minPrice: '',
            maxPrice: ''
        };
        onFilterChange(emptyFilters);
        // Opcional: Chamar a busca para atualizar a lista imediatamente
        onSearch(); 
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-4">
            <h3 className="font-semibold text-gray-700">Filtrar por:</h3>
            
            <input
                type="text"
                name="city"
                placeholder="Cidade"
                value={filters.city}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Status</option>
                <option value="pending">Pendente</option>
                <option value="active">Ativo</option>
                <option value="won">Ganho</option>
                <option value="sold">Vendido</option>
            </select>
            
            <button
                onClick={onSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
                Aplicar Filtros
            </button>
            
            {/* NOVO BOTÃO DE LIMPAR FILTROS */}
            <button
                onClick={handleClearFilters}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors"
            >
                Limpar Filtros
            </button>
        </div>
    );
}

export default Filters;