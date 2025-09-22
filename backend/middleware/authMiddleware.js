const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtém o token do cabeçalho de autorização
            token = req.headers.authorization.split(' ')[1];

            // Verifica o token com a chave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Encontra o usuário pelo ID do token e anexa ao objeto de requisição
            req.user = await User.findById(decoded.id).select('-password');
            
            next(); // Prossegue para a próxima função na rota
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token.' });
    }
};

module.exports = { protect };