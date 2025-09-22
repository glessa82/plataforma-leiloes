import { useState } from 'react';

function UserRegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Você precisa estar logado para cadastrar um usuário.');
      }

      const response = await fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao cadastrar usuário.');
      }

      setSuccess(true);
      setFormData({ username: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6">Cadastrar Novo Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Usuário:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Senha:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 mt-4 mb-4 font-bold">{error}</p>}
        {success && <p className="text-green-500 mt-4">Usuário cadastrado com sucesso!</p>}

        <div className="mt-8">
          <button 
            type="submit" 
            disabled={loading} 
            className={`p-3 rounded-lg text-white font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processando...' : 'Cadastrar Usuário'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserRegistrationForm;