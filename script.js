class TimeTimer {
    constructor() {
        // Add new properties
        this.timerMode = document.getElementById('timerMode');
        this.standardInput = document.querySelector('.standard-input');
        this.hoursInput = document.querySelector('.hours-input');
        this.pomodoroInput = document.querySelector('.pomodoro-input');
        this.pomoWork = document.getElementById('pomoWork');
        this.pomoBreak = document.getElementById('pomoBreak');
        this.hours = document.getElementById('hours');
        this.isBreak = false;
        this.pomoCount = 0;

        // Add mode change listener
        this.timerMode.addEventListener('change', () => this.handleModeChange());
        
        this.canvas = document.getElementById('timerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minutes = document.getElementById('minutes');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.colorButtons = document.querySelectorAll('.color-btn');
        this.timeDisplay = document.querySelector('.time-display');
        this.timeLeft = 0;
        this.totalTime = 0;
        this.isRunning = false;
        this.timerInterval = null;
        this.currentColor = '#dad7cd';

        this.setupCanvas();
        this.setupEventListeners();
        this.setupColorButtons();
        this.drawTimer();
    }

    setupCanvas() {
        this.canvas.width = 300;
        this.canvas.height = 300;
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
    }

    setupColorButtons() {
        this.colorButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const color = button.dataset.color;
                document.body.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5');
                document.body.classList.add(`color-${index + 1}`);
                
                // Set CSS variables for dynamic colors
                document.documentElement.style.setProperty('--accent-color', `${color}E6`);
                document.documentElement.style.setProperty('--accent-color-transparent', `${color}99`);
                document.documentElement.style.setProperty('--accent-color-hover', color);
                
                this.colorButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                this.currentColor = color;
                this.drawTimer();
            });
        });
        
        // Set initial color (first button)
        this.colorButtons[0].click();
    }
    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
            this.startBtn.textContent = 'Pause';
        } else {
            this.pauseTimer();
            this.startBtn.textContent = 'Start';
        }
    }

    handleModeChange() {
        const mode = this.timerMode.value;
        this.standardInput.style.display = mode === 'standard' ? 'block' : 'none';
        this.hoursInput.style.display = mode === 'hours' ? 'block' : 'none';
        this.pomodoroInput.style.display = mode === 'pomodoro' ? 'block' : 'none';
        
        // Update select element's data attribute for styling
        this.timerMode.setAttribute('data-mode', mode);
        
        // Set corresponding accent color
        let accentColor;
        switch(mode) {
            case 'standard':
                accentColor = '#588157';
                break;
            case 'hours':
                accentColor = '#3a5a40';
                break;
            case 'pomodoro':
                accentColor = '#dad7cd';
                break;
        }
        
        this.timerMode.style.borderColor = accentColor;
        this.resetTimer();
    }

    startTimer() {
        if (!this.isRunning) {
            if (this.timeLeft === 0) {
                switch(this.timerMode.value) {
                    case 'standard':
                        this.timeLeft = this.minutes.value * 60;
                        break;
                    case 'hours':
                        this.timeLeft = this.hours.value * 3600;
                        break;
                    case 'pomodoro':
                        this.timeLeft = (this.isBreak ? this.pomoBreak.value : this.pomoWork.value) * 60;
                        break;
                }
                this.totalTime = this.timeLeft;
            }
            this.isRunning = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    updateTimer() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.drawTimer();
            this.updateTimeDisplay();
        } else {
            if (this.timerMode.value === 'pomodoro') {
                this.handlePomodoroTransition();
            } else {
                this.pauseTimer();
                this.startBtn.textContent = 'Start';
            }
        }
    }

    handlePomodoroTransition() {
        this.isBreak = !this.isBreak;
        if (!this.isBreak) {
            this.pomoCount++;
        }
        this.timeLeft = (this.isBreak ? this.pomoBreak.value : this.pomoWork.value) * 60;
        this.totalTime = this.timeLeft;
        this.updateTimeDisplay();
        // Optional: Add notification sound or alert
        alert(this.isBreak ? 'Take a break!' : 'Back to work!');
    }

    updateTimeDisplay() {
        let timeString;
        if (this.timerMode.value === 'hours') {
            const hours = Math.floor(this.timeLeft / 3600);
            const minutes = Math.floor((this.timeLeft % 3600) / 60);
            const seconds = this.timeLeft % 60;
            timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        this.timeDisplay.textContent = timeString;
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = 0;
        this.totalTime = 0;
        this.startBtn.textContent = 'Start';
        this.isBreak = false;
        this.pomoCount = 0;
        this.drawTimer();
        this.updateTimeDisplay();
    }
    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    drawTimer() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 15;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw timer arc
        if (this.timeLeft > 0) {
            const maxMinutes = 60;
            const currentMinutes = this.timeLeft / 60;
            const angle = (currentMinutes / maxMinutes) * Math.PI * 2;
            
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle - Math.PI / 2);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.fillStyle = this.currentColor;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        // Draw outer circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Draw minute markers
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const outerRadius = radius;
            const innerRadius = radius - (i % 5 === 0 ? 8 : 4);
            
            const startX = centerX + Math.cos(angle) * innerRadius;
            const startY = centerY + Math.sin(angle) * innerRadius;
            const endX = centerX + Math.cos(angle) * outerRadius;
            const endY = centerY + Math.sin(angle) * outerRadius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.5;
            this.ctx.stroke();
        }

        // Draw minute numbers
        this.ctx.font = '500 14px -apple-system';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        for (let i = 0; i < 60; i += 5) {
            const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const markerRadius = radius - 25;
            const x = centerX + Math.cos(angle) * markerRadius;
            const y = centerY + Math.sin(angle) * markerRadius;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillText(i.toString(), x, y);
        }
    }
}

// Initialize the timer when the page loads
window.addEventListener('load', () => {
    new TimeTimer();
});