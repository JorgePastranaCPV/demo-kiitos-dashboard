// Animación suave al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('main');
    mainContent.style.opacity = '0';
    setTimeout(() => {
        mainContent.style.transition = 'opacity 0.5s ease-in-out';
        mainContent.style.opacity = '1';
    }, 100);
});

// Manejar la navegación con transiciones suaves
document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget.getAttribute('href');
        
        // Animación de salida
        document.querySelector('main').style.opacity = '0';
        
        // Navegar después de la animación
        setTimeout(() => {
            window.location.href = target;
        }, 300);
    });
});

// Actualizar estadísticas en tiempo real (simulado)
function updateStats() {
    const stats = {
        pacientesHoy: Math.floor(Math.random() * 5) + 10,
        tiempoPromedio: Math.floor(Math.random() * 10) + 20,
        eficiencia: Math.floor(Math.random() * 6) + 90,
        satisfaccion: (Math.floor(Math.random() * 5) + 45) / 10
    };

    document.querySelectorAll('.bg-white\\/80').forEach((stat, index) => {
        const value = stat.querySelector('p');
        switch(index) {
            case 0:
                value.textContent = `${stats.pacientesHoy}`;
                break;
            case 1:
                value.textContent = `${stats.tiempoPromedio} min`;
                break;
            case 2:
                value.textContent = `${stats.eficiencia}%`;
                break;
            case 3:
                value.textContent = `${stats.satisfaccion}/5`;
                break;
        }
    });
}

// Actualizar estadísticas cada 30 segundos
setInterval(updateStats, 30000); 