const http = require('http');
const https = require('https');

class LoadTester {
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const startTime = Date.now();
            
            const request = protocol.get(url, (response) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                resolve({
                    statusCode: response.statusCode,
                    responseTime: responseTime,
                    success: true
                });
            });
            
            request.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
            
            request.setTimeout(10000, () => {
                resolve({
                    success: false,
                    error: 'Timeout',
                    responseTime: 10000
                });
                request.destroy();
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
                batch.push(this.makeRequest(url));
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
        
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        
        console.log('\n📊 Результаты тестирования:');
        console.log(`✅ Успешных запросов: ${successful.length}`);
        console.log(`❌ Неудачных запросов: ${failed.length}`);
        console.log(`📈 Время ответа (среднее): ${avgResponseTime.toFixed(2)}ms`);
        console.log(`🎯 Процент успеха: ${((successful.length / results.length) * 100).toFixed(2)}%`);
    }
}

// Запуск теста
const tester = new LoadTester();
tester.runLoadTest('https://google.com', 20, 5);