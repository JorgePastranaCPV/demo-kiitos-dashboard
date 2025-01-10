import { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles = [];
        let animationFrameId;
        let mouse = { x: null, y: null, radius: 150 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            const numberOfParticles = 120;

            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 3 + 2,
                    speedX: (Math.random() - 0.5) * 0.8,
                    speedY: (Math.random() - 0.5) * 0.8,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                // Interacción con el mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - particle.x;
                    const dy = mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (mouse.radius - distance) / mouse.radius;

                        particle.x -= Math.cos(angle) * force * 2;
                        particle.y -= Math.sin(angle) * force * 2;
                    }
                }

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 195, 74, ${particle.opacity})`;
                ctx.fill();

                particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 180) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139, 195, 74, ${0.2 * (1 - distance / 180)})`;
                        ctx.lineWidth = 1.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        function handleMouseMove(event) {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        }

        function handleMouseLeave() {
            mouse.x = null;
            mouse.y = null;
        }

        resizeCanvas();
        createParticles();
        animate();

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('resize', createParticles);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', createParticles);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: '#f5f5f5'
            }}
        />
    );
} 