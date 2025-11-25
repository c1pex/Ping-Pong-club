// Импорт библиотеки Express
const express = require('express');
const app = express();
// Порт, на котором будет работать контейнер (совпадает с EXPOSE в Dockerfile)
const port = 3000;

// Middleware для обработки CORS-запросов (важно, чтобы ваш фронтенд мог обращаться к API)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешаем доступ с любого домена
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 1. Главный маршрут
app.get('/', (req, res) => {
  console.log('Received request on /');
  res.send('Mock API is running in Docker container!');
});

// 2. Маршрут для эмуляции получения данных (например, списка пользователей)
app.get('/api/data', (req, res) => {
  console.log('Received request on /api/data');
  
  // Эмуляция данных, которые могли бы прийти из Firebase
  const mockData = {
    status: 'success',
    message: 'Data retrieved successfully from Mock API',
    items: [
      { id: 1, name: 'Item A (from Docker)', value: 100 },
      { id: 2, name: 'Item B (from Docker)', value: 250 }
    ]
  };
  
  res.json(mockData);
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Mock API running at http://localhost:${port}`);
});