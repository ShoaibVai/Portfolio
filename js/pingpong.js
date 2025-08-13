// Background Ping Pong Game
// This adds a subtle ping pong game in the background of the portfolio site

class PingPongGame {
    constructor() {
        // Canvas setup
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.id = 'ping-pong-canvas';
        
        // Style the canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-5'; // Make sure it's above the background but below content
        this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
        this.canvas.style.opacity = '0.3'; // Slightly more visible
        
        // Append to body as first child so it's behind everything
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        // Game elements
        this.paddleHeight = this.canvas.height / 8; // Smaller paddles
        this.paddleWidth = 15; // Slightly wider for visibility
        this.paddleSpeed = 8; // Faster AI paddle speed
        
        // Left paddle (player 1 - AI)
        this.leftPaddle = {
            x: 10, // Move slightly away from the edge
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0,
            score: 0
        };
        
        // Right paddle (player 2 - AI)
        this.rightPaddle = {
            x: this.canvas.width - this.paddleWidth - 10, // Move slightly away from the edge
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0,
            score: 0
        };
        
        // Ball
        this.ballSize = 10; // Larger ball for better visibility
        this.ballTrail = []; // Store ball positions for trail effect
        this.trailLength = 5; // Length of trail
        this.resetBall();
        
        // Game state
        this.paused = false;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.resize = this.resize.bind(this);
        
        // Event listeners
        window.addEventListener('resize', this.resize);
        
        // Theme color adaptation
        this.updateColors();
        
        // Start the game loop
        this.lastTime = performance.now();
        this.start();
    }
    
    // Color theme adaptation
    updateColors() {
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        
        if (isDarkTheme) {
            this.backgroundColor = 'rgba(34, 38, 57, 0)'; // Transparent
            this.paddleColor = 'rgba(126, 87, 194, 0.9)'; // Primary color, more opaque
            this.ballColor = 'rgba(255, 221, 0, 0.9)'; // Accent color, more opaque
            this.trailColor = 'rgba(255, 221, 0, 0.4)'; // Trail color with transparency
        } else {
            this.backgroundColor = 'rgba(240, 240, 240, 0)'; // Transparent
            this.paddleColor = 'rgba(93, 52, 175, 0.9)'; // Primary color, more opaque
            this.ballColor = 'rgba(255, 204, 0, 0.9)'; // Accent color, more opaque
            this.trailColor = 'rgba(255, 204, 0, 0.4)'; // Trail color with transparency
        }
    }
    
    // Reset ball to center
    resetBall() {
        // Clear the trail
        this.ballTrail = [];
        
        // Create a new ball at center
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: (Math.random() > 0.5 ? 1 : -1) * 5, // Random direction, slightly faster
            dy: Math.random() * 5 - 2.5, // Random angle
            size: this.ballSize
        };
        
        // Normalize ball speed
        const speed = 5; // Slightly faster ball
        const magnitude = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        this.ball.dx = (this.ball.dx / magnitude) * speed;
        this.ball.dy = (this.ball.dy / magnitude) * speed;
    }
    
    // AI paddle movement
    moveAIPaddles() {
        // Left paddle AI - follow the ball with some delay and randomness
        const leftPaddleCenter = this.leftPaddle.y + this.leftPaddle.height / 2;
        const leftTargetY = this.ball.y - this.leftPaddle.height / 2;
        
        // Add randomness to make it more interesting
        const leftRandomness = Math.random() * 20 - 10;
        
        // Move towards the ball with some delay
        if (this.ball.y + leftRandomness < leftPaddleCenter - 30) {
            this.leftPaddle.dy = -this.paddleSpeed;
        } else if (this.ball.y + leftRandomness > leftPaddleCenter + 30) {
            this.leftPaddle.dy = this.paddleSpeed;
        } else {
            this.leftPaddle.dy = 0;
        }
        
        // Right paddle AI - similar but with different randomness
        const rightPaddleCenter = this.rightPaddle.y + this.rightPaddle.height / 2;
        const rightTargetY = this.ball.y - this.rightPaddle.height / 2;
        
        // Add different randomness to make it asymmetric
        const rightRandomness = Math.random() * 20 - 10;
        
        // Move towards the ball with some delay
        if (this.ball.y + rightRandomness < rightPaddleCenter - 30) {
            this.rightPaddle.dy = -this.paddleSpeed;
        } else if (this.ball.y + rightRandomness > rightPaddleCenter + 30) {
            this.rightPaddle.dy = this.paddleSpeed;
        } else {
            this.rightPaddle.dy = 0;
        }
        
        // Update paddle positions
        this.leftPaddle.y += this.leftPaddle.dy;
        this.rightPaddle.y += this.rightPaddle.dy;
        
        // Keep paddles in bounds
        if (this.leftPaddle.y < 0) {
            this.leftPaddle.y = 0;
        } else if (this.leftPaddle.y + this.leftPaddle.height > this.canvas.height) {
            this.leftPaddle.y = this.canvas.height - this.leftPaddle.height;
        }
        
        if (this.rightPaddle.y < 0) {
            this.rightPaddle.y = 0;
        } else if (this.rightPaddle.y + this.rightPaddle.height > this.canvas.height) {
            this.rightPaddle.y = this.canvas.height - this.rightPaddle.height;
        }
    }
    
    // Collision detection and physics
    checkCollisions() {
        // Ball collision with top and bottom walls
        if (this.ball.y - this.ball.size < 0 || 
            this.ball.y + this.ball.size > this.canvas.height) {
            this.ball.dy = -this.ball.dy;
            
            // Adjust position to prevent sticking
            if (this.ball.y - this.ball.size < 0) {
                this.ball.y = this.ball.size;
            } else {
                this.ball.y = this.canvas.height - this.ball.size;
            }
        }
        
        // Ball collision with left paddle
        if (this.ball.x - this.ball.size < this.leftPaddle.x + this.leftPaddle.width &&
            this.ball.x + this.ball.size > this.leftPaddle.x &&
            this.ball.y > this.leftPaddle.y &&
            this.ball.y < this.leftPaddle.y + this.leftPaddle.height) {
            
            // Bounce and add some angle based on where it hit the paddle
            this.ball.dx = Math.abs(this.ball.dx); // Keep speed constant
            const paddleCenter = this.leftPaddle.y + this.leftPaddle.height / 2;
            const relativeIntersect = paddleCenter - this.ball.y;
            const normalizedRelativeIntersect = relativeIntersect / (this.leftPaddle.height / 2);
            this.ball.dy = -normalizedRelativeIntersect * 5;
            
            // Move ball out of paddle
            this.ball.x = this.leftPaddle.x + this.leftPaddle.width + this.ball.size;
        }
        
        // Ball collision with right paddle
        if (this.ball.x + this.ball.size > this.rightPaddle.x &&
            this.ball.x - this.ball.size < this.rightPaddle.x + this.rightPaddle.width &&
            this.ball.y > this.rightPaddle.y &&
            this.ball.y < this.rightPaddle.y + this.rightPaddle.height) {
            
            // Bounce and add some angle based on where it hit the paddle
            this.ball.dx = -Math.abs(this.ball.dx); // Keep speed constant
            const paddleCenter = this.rightPaddle.y + this.rightPaddle.height / 2;
            const relativeIntersect = paddleCenter - this.ball.y;
            const normalizedRelativeIntersect = relativeIntersect / (this.rightPaddle.height / 2);
            this.ball.dy = -normalizedRelativeIntersect * 5;
            
            // Move ball out of paddle
            this.ball.x = this.rightPaddle.x - this.ball.size;
        }
        
        // Ball out of bounds (left or right)
        if (this.ball.x - this.ball.size < 0) {
            this.rightPaddle.score++;
            this.resetBall();
        } else if (this.ball.x + this.ball.size > this.canvas.width) {
            this.leftPaddle.score++;
            this.resetBall();
        }
    }
    
    // Update game state
    update(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        if (this.paused) return;
        
        // Add current ball position to trail
        this.ballTrail.push({x: this.ball.x, y: this.ball.y});
        
        // Keep trail at desired length
        while (this.ballTrail.length > this.trailLength) {
            this.ballTrail.shift();
        }
        
        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Update paddles
        this.moveAIPaddles();
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Draw game elements
    draw() {
        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line (dashed)
        this.ctx.beginPath();
        this.ctx.setLineDash([10, 15]);
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = this.paddleColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw ball trail
        for (let i = 0; i < this.ballTrail.length; i++) {
            const position = this.ballTrail[i];
            const alpha = i / this.ballTrail.length; // Fade out older positions
            const size = this.ball.size * (0.5 + alpha * 0.5); // Smaller for older positions
            
            this.ctx.fillStyle = this.trailColor;
            this.ctx.beginPath();
            this.ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw ball
        this.ctx.fillStyle = this.ballColor;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw paddles
        this.ctx.fillStyle = this.paddleColor;
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);
    }
    
    // Game loop
    gameLoop(timestamp) {
        this.update(timestamp);
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // Start game
    start() {
        this.paused = false;
        this.gameLoop(performance.now());
    }
    
    // Pause game
    pause() {
        this.paused = true;
    }
    
    // Resume game
    resume() {
        if (this.paused) {
            this.paused = false;
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }
    }
    
    // Handle window resize
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Adjust paddle positions
        this.paddleHeight = this.canvas.height / 8;
        
        this.leftPaddle.height = this.paddleHeight;
        this.leftPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.leftPaddle.x = 10;
        
        this.rightPaddle.height = this.paddleHeight;
        this.rightPaddle.x = this.canvas.width - this.paddleWidth - 10;
        this.rightPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        
        // Adjust ball position
        if (this.ball.x > this.canvas.width) {
            this.ball.x = this.canvas.width / 2;
        }
        if (this.ball.y > this.canvas.height) {
            this.ball.y = this.canvas.height / 2;
        }
        
        // Clear trail after resize
        this.ballTrail = [];
    }
    
    // Clean up resources
    destroy() {
        window.removeEventListener('resize', this.resize);
        this.canvas.remove();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short time for other elements to initialize
    setTimeout(() => {
        // Create the ping pong game
        const pingPong = new PingPongGame();
        
        // Update colors when theme changes
        const toggleThemeButton = document.getElementById('toggle-theme');
        if (toggleThemeButton) {
            toggleThemeButton.addEventListener('click', () => {
                // Let the DOM update first, then update colors
                setTimeout(() => {
                    pingPong.updateColors();
                }, 50);
            });
        }
        
        // Expose the ping pong game to the window for debugging
        window.pingPong = pingPong;
    }, 500);
});
