window.onload = function () {
    const canvas = document.getElementById('chartCanvas');
    const context = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    const config = {
        xIncrement: 150,
        yIncrement: 100,
        valueIncrement: 20,
        textOffset: 5,
        updateInterval: 1000,
        minValue: 0,
        maxValue: height,
        showGrid: true,
        smoothLines: false,
        chartType: 'line',
        isPlaying: true
    };

    const series = [
        {
            data: [],
            color: null,
            enabled: true,
            name: 'Series 1',
            cssVar: '--series1-color'
        },
        {
            data: [],
            color: null,
            enabled: true,
            name: 'Series 2',
            cssVar: '--series2-color'
        },
        {
            data: [],
            color: null,
            enabled: true,
            name: 'Series 3',
            cssVar: '--series3-color'
        }
    ];

    let animationInterval = null;

    function getComputedColor(cssVar) {
        return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    }

    function updateSeriesColors() {
        series.forEach(s => {
            s.color = getComputedColor(s.cssVar);
        });
    }

    function generateRandomNumber() {
        return parseInt(Math.random() * (config.maxValue - config.minValue) + config.minValue);
    }

    function generateData() {
        const numPoints = Math.floor(width / config.valueIncrement) + 1;
        series.forEach(s => {
            s.data = [];
            for (let i = 0; i < numPoints; i++) {
                s.data.push(generateRandomNumber());
            }
        });
    }

    function generateNewValue() {
        series.forEach(s => {
            const newValue = generateRandomNumber();
            s.data.push(newValue);
            s.data.shift();
        });
    }

    function drawGrid() {
        if (!config.showGrid) return;

        const gridColor = getComputedColor('--grid-color');
        context.strokeStyle = gridColor;
        context.lineWidth = 1;

        for (let i = 0; i < width; i += config.xIncrement) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, height);
            context.stroke();
        }

        for (let i = 0; i < height; i += config.yIncrement) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(width, i);
            context.stroke();
        }
    }

    function drawLabels() {
        if (!config.showGrid) return;

        const textColor = getComputedColor('--text-secondary');
        context.fillStyle = textColor;
        context.font = '12px Inter, sans-serif';

        for (let i = 0; i < height; i += config.yIncrement) {
            context.fillText(height - i, config.textOffset, i + 2 * config.textOffset);
        }

        for (let i = 0; i < width; i += config.xIncrement) {
            context.fillText(i, i + config.textOffset, height - config.textOffset);
        }
    }

    function drawLineChart(seriesData, color) {
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        if (config.smoothLines) {
            drawSmoothLine(seriesData, color);
        } else {
            context.beginPath();
            context.moveTo(0, height - seriesData[0]);

            for (let i = 1; i < seriesData.length; i++) {
                context.lineTo(i * config.valueIncrement, height - seriesData[i]);
            }

            context.stroke();
        }
    }

    function drawSmoothLine(seriesData, color) {
        if (seriesData.length < 2) return;

        context.beginPath();
        context.moveTo(0, height - seriesData[0]);

        for (let i = 1; i < seriesData.length - 1; i++) {
            const x1 = (i - 1) * config.valueIncrement;
            const y1 = height - seriesData[i - 1];
            const x2 = i * config.valueIncrement;
            const y2 = height - seriesData[i];
            const x3 = (i + 1) * config.valueIncrement;
            const y3 = height - seriesData[i + 1];

            const cp1x = x1 + (x2 - x1) * 0.5;
            const cp1y = y1;
            const cp2x = x2 - (x3 - x2) * 0.5;
            const cp2y = y2;

            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
        }

        const lastIdx = seriesData.length - 1;
        context.lineTo(lastIdx * config.valueIncrement, height - seriesData[lastIdx]);
        context.stroke();
    }

    function drawAreaChart(seriesData, color) {
        context.fillStyle = color + '40';
        context.strokeStyle = color;
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(0, height);
        context.lineTo(0, height - seriesData[0]);

        for (let i = 1; i < seriesData.length; i++) {
            context.lineTo(i * config.valueIncrement, height - seriesData[i]);
        }

        context.lineTo((seriesData.length - 1) * config.valueIncrement, height);
        context.closePath();
        context.fill();
        context.stroke();
    }

    function drawBarChart(seriesData, color, offset, totalSeries) {
        const barWidth = config.valueIncrement / (totalSeries + 1);
        context.fillStyle = color;

        for (let i = 0; i < seriesData.length; i++) {
            const x = i * config.valueIncrement + offset * barWidth;
            const barHeight = seriesData[i];
            context.fillRect(x, height - barHeight, barWidth * 0.9, barHeight);
        }
    }

    function drawScatterPlot(seriesData, color) {
        context.fillStyle = color;

        for (let i = 0; i < seriesData.length; i++) {
            const x = i * config.valueIncrement;
            const y = height - seriesData[i];

            context.beginPath();
            context.arc(x, y, 4, 0, Math.PI * 2);
            context.fill();
        }
    }

    function drawChart() {
        const enabledSeries = series.filter(s => s.enabled);

        enabledSeries.forEach((s, index) => {
            switch (config.chartType) {
                case 'line':
                    drawLineChart(s.data, s.color);
                    break;
                case 'area':
                    drawAreaChart(s.data, s.color);
                    break;
                case 'bar':
                    drawBarChart(s.data, s.color, index, enabledSeries.length);
                    break;
                case 'scatter':
                    drawScatterPlot(s.data, s.color);
                    break;
            }
        });
    }

    function draw() {
        updateSeriesColors();

        const canvasBg = getComputedColor('--canvas-bg');
        context.fillStyle = canvasBg;
        context.fillRect(0, 0, width, height);

        drawGrid();
        drawLabels();
        drawChart();
        updateStatistics();
    }

    function calculateStats(data) {
        if (data.length === 0) return { current: 0, max: 0, min: 0, avg: 0, trend: 'stable' };

        const current = data[data.length - 1];
        const max = Math.max(...data);
        const min = Math.min(...data);
        const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

        let trend = 'stable';
        if (data.length >= 10) {
            const recent = data.slice(-5).reduce((a, b) => a + b, 0) / 5;
            const previous = data.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
            const diff = recent - previous;

            if (diff > 20) trend = 'rising';
            else if (diff < -20) trend = 'falling';
        }

        return { current, max, min, avg, trend };
    }

    function updateStatistics() {
        series.forEach((s, index) => {
            const stats = calculateStats(s.data);
            const prefix = `s${index + 1}`;

            document.getElementById(`${prefix}-current`).textContent = Math.round(stats.current);
            document.getElementById(`${prefix}-max`).textContent = Math.round(stats.max);
            document.getElementById(`${prefix}-min`).textContent = Math.round(stats.min);
            document.getElementById(`${prefix}-avg`).textContent = Math.round(stats.avg);

            const trendElement = document.getElementById(`${prefix}-trend`);
            trendElement.textContent = stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1);
            trendElement.className = `stat-value trend ${stats.trend}`;
        });
    }

    const tooltip = document.getElementById('tooltip');

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dataIndex = Math.round(x / config.valueIncrement);

        if (dataIndex >= 0 && dataIndex < series[0].data.length) {
            let tooltipContent = `<strong>Position: ${dataIndex * config.valueIncrement}</strong><br>`;

            series.forEach((s, index) => {
                if (s.enabled) {
                    const value = Math.round(s.data[dataIndex]);
                    tooltipContent += `${s.name}: ${value}<br>`;
                }
            });

            tooltip.innerHTML = tooltipContent;
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
            tooltip.classList.add('visible');
        }
    });

    canvas.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });

    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.addEventListener('click', () => {
        config.isPlaying = !config.isPlaying;
        playPauseBtn.textContent = config.isPlaying ? 'Pause' : 'Play';

        if (config.isPlaying) {
            startAnimation();
        } else {
            stopAnimation();
        }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        generateData();
        draw();
    });

    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    speedSlider.addEventListener('input', (e) => {
        config.updateInterval = parseInt(e.target.value);
        speedValue.textContent = config.updateInterval + 'ms';

        if (config.isPlaying) {
            stopAnimation();
            startAnimation();
        }
    });

    document.getElementById('minValue').addEventListener('change', (e) => {
        config.minValue = parseInt(e.target.value);
        if (config.minValue >= config.maxValue) {
            config.minValue = config.maxValue - 1;
            e.target.value = config.minValue;
        }
    });

    document.getElementById('maxValue').addEventListener('change', (e) => {
        config.maxValue = parseInt(e.target.value);
        if (config.maxValue <= config.minValue) {
            config.maxValue = config.minValue + 1;
            e.target.value = config.maxValue;
        }
    });

    document.getElementById('chartType').addEventListener('change', (e) => {
        config.chartType = e.target.value;
        draw();
    });

    document.getElementById('series1').addEventListener('change', (e) => {
        series[0].enabled = e.target.checked;
        draw();
    });

    document.getElementById('series2').addEventListener('change', (e) => {
        series[1].enabled = e.target.checked;
        draw();
    });

    document.getElementById('series3').addEventListener('change', (e) => {
        series[2].enabled = e.target.checked;
        draw();
    });

    document.getElementById('showGrid').addEventListener('change', (e) => {
        config.showGrid = e.target.checked;
        draw();
    });

    document.getElementById('smoothLines').addEventListener('change', (e) => {
        config.smoothLines = e.target.checked;
        draw();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `chart-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            themeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const body = document.body;
            body.classList.remove('dark-theme', 'high-contrast-theme');

            if (e.target.id === 'themeDark') {
                body.classList.add('dark-theme');
            } else if (e.target.id === 'themeHighContrast') {
                body.classList.add('high-contrast-theme');
            }

            draw();
        });
    });

    function startAnimation() {
        animationInterval = setInterval(() => {
            generateNewValue();
            draw();
        }, config.updateInterval);
    }

    function stopAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }

    updateSeriesColors();
    generateData();
    draw();
    startAnimation();
};