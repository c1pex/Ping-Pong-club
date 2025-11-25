const http = require('http');
const https = require('https');

class LoadTester {
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const startTime = Date.now();
            
            // Флаг для гарантии однократного завершения промиса
            let isResolved = false;

            const safeResolve = (result) => {
                if (!isResolved) {
                    isResolved = true;
                    resolve(result);
                }
            };
            
            const request = protocol.get(url, (response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                safeResolve({
                    statusCode: response.statusCode,
                    responseTime: responseTime,
                    success: true
                });
            });
            
            request.on('error', (error) => {
                safeResolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
            
            request.setTimeout(10000, () => {
                // Если таймаут, уничтожаем запрос и резолвим с ошибкой
                request.destroy();
                safeResolve({
                    success: false,
                    error: 'Timeout',
                    responseTime: 10000
                });
            });
        });
    }
    
    async runLoadTest(url, requests = 10, concurrent = 2) {
        console.log(`🚀 Запуск нагрузочного теста: ${url}`);
        console.log(`Запросов: ${requests}, Параллельно: ${concurrent}\n`);
        
        const results = [];
        
        for (let i = 0; i < requests; i += concurrent) {
            const batch = [];
            
            for (let j = 0; j < concurrent && (i + j) < requests; j++) {
                // Используем .catch, хотя makeRequest резолвит ошибки,
                // это добавляет дополнительный уровень безопасности.
                batch.push(this.makeRequest(url).catch(err => ({ success: false, error: err.message, responseTime: 0 })));
            }
            
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
            process.stdout.write(`Выполнено: ${results.length}/${requests}\r`);
        }
        
        this.analyzeResults(results);
    }
    
    analyzeResults(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        const responseTimes = successful.map(r => r.responseTime);
        
        // Обработка случая, когда нет успешных запросов
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        // Определяем общий процент
        const successRate = results.length > 0
            ? ((successful.length / results.length) * 100).toFixed(2)
            : 0;
        
        console.log('\n📊 Результаты тестирования:');
        console.log(`✅ Успешных запросов: ${successful.length}`);
        console.log(`❌ Неудачных запросов: ${failed.length}`);
        console.log(`📈 Время ответа (среднее): ${avgResponseTime.toFixed(2)}ms`);
        console.log(`🎯 Процент успешных: ${successRate}%`);
    }
}

// Запуск теста
const tester = new LoadTester();
// Замените на URL вашего фронтенда, который доступен через Docker (8080)
const FRONTEND_URL = 'http://localhost:3001/'; 
tester.runLoadTest(FRONTEND_URL, 50, 5); // 50 запросов, 5 параллельно