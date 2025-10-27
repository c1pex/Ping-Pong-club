const https = require('https');
const http = require('http');

function checkWebsite(url) {
    const protocol = url.startsWith('https') ? https : http;
    
    const startTime = Date.now();
    
    const request = protocol.get(url, (response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`✅ Сайт ${url} доступен`);
        console.log(`Статус: ${response.statusCode}`);
        console.log(`Время ответа: ${responseTime}ms`);
        
        request.end();
    });
    
    request.on('error', (error) => {
        console.log(`❌ Ошибка при проверке ${url}:`, error.message);
    });
    
    request.setTimeout(10000, () => {
        console.log(`⏰ Таймаут при проверке ${url}`);
        request.destroy();
    });
}

// Тестируем нужные сайты
const websites = [
    'https://google.com',
    'https://github.com'
    // Добавь здесь URL своего сайта
];

console.log('🚀 Запуск тестирования сайтов...\n');
websites.forEach(site => {
    checkWebsite(site);
});