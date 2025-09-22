const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Pega o token do cabeçalho de autorização
  const token = req.header('Authorization');

  // Verifica se o token existe e tem o formato 'Bearer <token>'
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Nenhum token fornecido ou token inválido, acesso negado.' });
  }

  try {
    const tokenWithoutBearer = token.replace('Bearer ', '');
    // Verifica e decodifica o token usando sua chave secreta
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    
    // Adiciona as informações do usuário logado à requisição para uso posterior
    req.user = decoded.user;
    next(); // Continua para a próxima função (a rota de registro)
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = authMiddleware;