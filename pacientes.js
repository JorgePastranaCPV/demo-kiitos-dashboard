// Clase para manejar los pacientes
class PacientesManager {
    constructor() {
        this.pacientes = this.loadPacientes();
        this.renderizarPacientes();
        this.initializeEventListeners();
    }

    loadPacientes() {
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const hoy = new Date().toISOString().split('T')[0]; // Obtener fecha actual en formato YYYY-MM-DD
        
        // Filtrar solo las citas del día actual
        return citas.filter(cita => cita.fecha === hoy)
            .sort((a, b) => a.hora.localeCompare(b.hora));
    }

    renderizarPacientes() {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        this.pacientes.forEach(paciente => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            
            tr.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            ${paciente.nombre.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${paciente.nombre}</div>
                            <div class="text-sm text-gray-500">${paciente.rut}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${paciente.fecha}</div>
                    <div class="text-sm text-gray-500">${paciente.hora}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getEstadoClass(paciente.estado)}">
                        ${paciente.estado}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-500">${paciente.medioAtencion || 'Presencial'}</span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button class="text-apple-blue hover:text-blue-700 editar-paciente" data-id="${paciente.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-400 hover:text-red-600 eliminar-paciente" data-id="${paciente.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    getEstadoClass(estado) {
        const clases = {
            'En espera': 'bg-yellow-100 text-yellow-800',
            'En consulta': 'bg-blue-100 text-blue-800',
            'Atendido': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800'
        };
        return clases[estado] || 'bg-gray-100 text-gray-800';
    }

    actualizarPaciente(pacienteData) {
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const index = citas.findIndex(p => p.id === pacienteData.id);
        if (index !== -1) {
            citas[index] = { ...citas[index], ...pacienteData };
            localStorage.setItem('citas', JSON.stringify(citas));
            this.pacientes = this.loadPacientes(); // Recargar solo los pacientes del día
            this.renderizarPacientes();
        }
    }

    eliminarPaciente(id) {
        if (confirm('¿Está seguro de eliminar este paciente?')) {
            const citas = JSON.parse(localStorage.getItem('citas') || '[]');
            const citasActualizadas = citas.filter(p => p.id !== id);
            localStorage.setItem('citas', JSON.stringify(citasActualizadas));
            this.pacientes = this.loadPacientes(); // Recargar solo los pacientes del día
            this.renderizarPacientes();
        }
    }

    initializeEventListeners() {
        // Búsqueda
        const searchInput = document.querySelector('input[placeholder="Buscar pacientes..."]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const pacientesFiltrados = this.pacientes.filter(p => 
                    p.nombre.toLowerCase().includes(query) ||
                    p.rut.toLowerCase().includes(query)
                );
                this.renderizarPacientesFiltrados(pacientesFiltrados);
            });
        }

        // Filtro de estado
        const estadoSelect = document.querySelector('select');
        if (estadoSelect) {
            estadoSelect.addEventListener('change', (e) => {
                const estado = e.target.value;
                if (estado === 'Todos los estados') {
                    this.renderizarPacientes();
                } else {
                    const pacientesFiltrados = this.pacientes.filter(p => p.estado === estado);
                    this.renderizarPacientesFiltrados(pacientesFiltrados);
                }
            });
        }

        // Botón nuevo paciente
        const btnNuevo = document.querySelector('button:has(i.fa-plus)');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.mostrarFormularioPaciente());
        }

        // Eventos de edición y eliminación
        document.addEventListener('click', (e) => {
            const editarBtn = e.target.closest('.editar-paciente');
            const eliminarBtn = e.target.closest('.eliminar-paciente');

            if (editarBtn) {
                const id = parseInt(editarBtn.dataset.id);
                const paciente = this.pacientes.find(p => p.id === id);
                if (paciente) {
                    this.mostrarFormularioPaciente(paciente);
                }
            } else if (eliminarBtn) {
                const id = parseInt(eliminarBtn.dataset.id);
                this.eliminarPaciente(id);
            }
        });
    }

    renderizarPacientesFiltrados(pacientes) {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        pacientes.forEach(paciente => {
            // Usar el mismo formato de renderización que en renderizarPacientes
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            // ... resto del código de renderización
            tbody.appendChild(tr);
        });
    }

    mostrarFormularioPaciente(paciente = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
                <div class="mt-3">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">${paciente ? 'Editar' : 'Nuevo'} Paciente</h3>
                    <form id="pacienteForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre</label>
                            <input type="text" name="nombre" value="${paciente?.nombre || ''}" required
                                class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">RUT</label>
                            <input type="text" name="rut" value="${paciente?.rut || ''}" required
                                class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Estado</label>
                            <select name="estado" class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                                <option value="En espera" ${paciente?.estado === 'En espera' ? 'selected' : ''}>En espera</option>
                                <option value="En consulta" ${paciente?.estado === 'En consulta' ? 'selected' : ''}>En consulta</option>
                                <option value="Atendido" ${paciente?.estado === 'Atendido' ? 'selected' : ''}>Atendido</option>
                                <option value="Cancelado" ${paciente?.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition">
                                Cancelar
                            </button>
                            <button type="submit" class="px-4 py-2 bg-apple-blue text-white rounded-xl hover:bg-blue-600 transition">
                                ${paciente ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('button[type="button"]').addEventListener('click', () => modal.remove());
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const pacienteData = {
                id: paciente?.id || Date.now(),
                nombre: formData.get('nombre'),
                rut: formData.get('rut'),
                estado: formData.get('estado'),
                ...paciente
            };

            if (paciente) {
                this.actualizarPaciente(pacienteData);
            } else {
                this.agregarPaciente(pacienteData);
            }

            modal.remove();
        });
    }

    agregarPaciente(paciente) {
        this.pacientes.push(paciente);
        this.guardarPacientes();
        this.renderPacientes();
    }

    cambiarEstado(id, nuevoEstado) {
        const paciente = this.pacientes.find(p => p.id === id);
        if (paciente) {
            paciente.estado = nuevoEstado;
            this.guardarPacientes();
            this.renderPacientes();
        }
    }

    guardarPacientes() {
        localStorage.setItem('pacientes', JSON.stringify(this.pacientes));
    }

    renderPacientes(pacientesAMostrar = this.pacientes) {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        pacientesAMostrar.forEach(paciente => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition';
            
            const estadoClases = {
                'En espera': 'bg-yellow-100 text-yellow-800',
                'En consulta': 'bg-blue-100 text-blue-800',
                'Atendido': 'bg-green-100 text-green-800'
            };

            tr.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            ${paciente.nombre.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${paciente.nombre}</div>
                            <div class="text-sm text-gray-500">${paciente.rut}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${paciente.hora}</div>
                    <div class="text-sm text-gray-500">${paciente.duracion} min</div>
                </td>
                <td class="px-6 py-4">
                    <div class="relative">
                        <button class="estado-btn px-3 py-1 rounded-full text-xs font-medium ${estadoClases[paciente.estado]}">
                            ${paciente.estado}
                        </button>
                        <div class="estado-menu hidden absolute z-10 mt-2 w-48 rounded-xl bg-white shadow-lg">
                            <div class="py-1">
                                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-estado="En espera">En espera</button>
                                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-estado="En consulta">En consulta</button>
                                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-estado="Atendido">Atendido</button>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-500">${paciente.tipo}</span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button class="text-apple-blue hover:text-blue-700 editar-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-400 hover:text-red-600 eliminar-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            // Event listeners para las acciones
            tr.querySelector('.editar-btn').addEventListener('click', () => this.mostrarFormularioPaciente(paciente));
            tr.querySelector('.eliminar-btn').addEventListener('click', () => this.eliminarPaciente(paciente.id));
            
            const estadoBtn = tr.querySelector('.estado-btn');
            const estadoMenu = tr.querySelector('.estado-menu');
            
            estadoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                estadoMenu.classList.toggle('hidden');
            });

            estadoMenu.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const nuevoEstado = e.target.dataset.estado;
                    this.cambiarEstado(paciente.id, nuevoEstado);
                    estadoMenu.classList.add('hidden');
                });
            });

            tbody.appendChild(tr);
        });
    }
}

// Inicializar el gestor de pacientes cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new PacientesManager();
}); 