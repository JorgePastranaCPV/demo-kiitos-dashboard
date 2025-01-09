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
            tr.className = 'hover:bg-gray-50 cursor-pointer transition-colors';
            
            tr.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium cursor-pointer hover:bg-blue-200 transition-colors">
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

            // Agregar evento click al avatar para antecedentes
            const avatarBtn = tr.querySelector('.w-8.h-8');
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se propague al tr
                this.mostrarAntecedentes(paciente);
            });

            // Agregar evento click a la fila para la ficha clínica
            tr.addEventListener('click', () => this.abrirFichaClinica(paciente));

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

    mostrarAntecedentes(paciente) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-2 mx-auto p-3 sm:p-4 lg:p-6 border w-full max-w-6xl shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl mb-4">
                <!-- Header del Modal -->
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-xl sm:text-2xl font-light text-gray-800">Antecedentes del Paciente</h2>
                        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Información médica completa y actualizada</p>
                    </div>
                    <button class="text-gray-500 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>

                <!-- Contenido Principal -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <!-- Columna 1: Información Personal -->
                    <div class="space-y-3">
                        <!-- Tarjeta de Perfil -->
                        <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm">
                            <div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white p-1 shadow-lg mb-3 overflow-hidden">
                                <img src="${paciente.foto || 'https://via.placeholder.com/128'}" 
                                     alt="${paciente.nombre}" 
                                     class="w-full h-full object-cover rounded-full">
                            </div>
                            <h3 class="text-base sm:text-lg font-medium text-gray-800 mb-0.5">${paciente.nombre}</h3>
                            <p class="text-sm text-gray-500 mb-2">${paciente.rut}</p>
                            <div class="flex flex-wrap justify-center gap-1.5">
                                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    ${paciente.estado || 'Sin estado'}
                                </span>
                                <span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    ${paciente.medioAtencion || 'Presencial'}
                                </span>
                            </div>
                        </div>

                        <!-- Datos Demográficos -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-blue-50 rounded-lg">
                                    <i class="fas fa-user text-blue-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Datos Demográficos</h4>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <span class="text-gray-500">Edad</span>
                                <span class="text-gray-700 font-medium">${paciente.edad || 'No registrada'}</span>
                                <span class="text-gray-500">Género</span>
                                <span class="text-gray-700 font-medium">${paciente.genero || 'No registrado'}</span>
                                <span class="text-gray-500">Estado Civil</span>
                                <span class="text-gray-700 font-medium">${paciente.estadoCivil || 'No registrado'}</span>
                                <span class="text-gray-500">Ocupación</span>
                                <span class="text-gray-700 font-medium">${paciente.ocupacion || 'No registrada'}</span>
                            </div>
                        </div>

                        <!-- Hábitos -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-emerald-50 rounded-lg">
                                    <i class="fas fa-heart text-emerald-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Hábitos y Estilo de Vida</h4>
                            </div>
                            <div class="space-y-1.5 text-xs">
                                <div class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg">
                                    <span class="text-gray-500">Fumador</span>
                                    <span class="font-medium ${paciente.habitos?.fumador ? 'text-red-500' : 'text-green-500'}">
                                        ${paciente.habitos?.fumador ? 'Sí' : 'No'}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg">
                                    <span class="text-gray-500">Alcohol</span>
                                    <span class="font-medium text-gray-700">
                                        ${paciente.habitos?.alcohol || 'No registrado'}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg">
                                    <span class="text-gray-500">Actividad Física</span>
                                    <span class="font-medium text-gray-700">
                                        ${paciente.habitos?.actividadFisica || 'No registrado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Columna 2: Condiciones Médicas -->
                    <div class="space-y-3">
                        <!-- Enfermedades Crónicas -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-red-50 rounded-lg">
                                    <i class="fas fa-heartbeat text-red-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Enfermedades Crónicas</h4>
                            </div>
                            <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-2 text-xs">
                                ${(paciente.enfermedadesCronicas || []).map(enfermedad => `
                                    <div class="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-lg">
                                        <i class="fas fa-circle text-[6px] text-red-500"></i>
                                        <span class="text-gray-700">${enfermedad}</span>
                                    </div>
                                `).join('') || '<p class="text-gray-500 italic">No se registran enfermedades crónicas</p>'}
                            </div>
                        </div>

                        <!-- Alergias -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-yellow-50 rounded-lg">
                                    <i class="fas fa-exclamation-triangle text-yellow-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Alergias</h4>
                            </div>
                            <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-2 text-xs">
                                ${(paciente.alergias || []).map(alergia => `
                                    <div class="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-lg">
                                        <i class="fas fa-circle text-[6px] text-yellow-500"></i>
                                        <span class="text-gray-700">${alergia}</span>
                                    </div>
                                `).join('') || '<p class="text-gray-500 italic">No se registran alergias</p>'}
                            </div>
                        </div>

                        <!-- Cirugías -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-indigo-50 rounded-lg">
                                    <i class="fas fa-procedures text-indigo-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Cirugías</h4>
                            </div>
                            <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-2 text-xs">
                                ${(paciente.cirugias || []).map(cirugia => `
                                    <div class="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-lg">
                                        <i class="fas fa-circle text-[6px] text-indigo-500"></i>
                                        <span class="text-gray-700">${cirugia}</span>
                                    </div>
                                `).join('') || '<p class="text-gray-500 italic">No se registran cirugías</p>'}
                            </div>
                        </div>
                    </div>

                    <!-- Columna 3: Medicamentos e Información Adicional -->
                    <div class="space-y-3">
                        <!-- Medicamentos -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-purple-50 rounded-lg">
                                    <i class="fas fa-pills text-purple-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Medicamentos Actuales</h4>
                            </div>
                            <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-2 text-xs">
                                ${(paciente.farmacos || []).map(farmaco => `
                                    <div class="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-lg">
                                        <i class="fas fa-circle text-[6px] text-purple-500"></i>
                                        <span class="text-gray-700">${farmaco}</span>
                                    </div>
                                `).join('') || '<p class="text-gray-500 italic">No se registran medicamentos</p>'}
                            </div>
                        </div>

                        <!-- Información Adicional -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="p-1.5 bg-orange-50 rounded-lg">
                                    <i class="fas fa-info-circle text-orange-500 text-sm"></i>
                                </div>
                                <h4 class="font-medium text-gray-700 text-sm">Información Adicional</h4>
                            </div>
                            <div class="space-y-2">
                                <!-- Riesgo CV -->
                                <div class="p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center space-x-2">
                                            <i class="fas fa-heart text-red-500 text-xs"></i>
                                            <span class="text-xs text-gray-700">Riesgo Cardiovascular</span>
                                        </div>
                                        <span class="text-xs font-medium text-red-600">${paciente.riesgoCV || 'No evaluado'}</span>
                                    </div>
                                </div>

                                <!-- Lista de Espera -->
                                <div class="p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center space-x-2">
                                            <i class="fas fa-user-clock text-orange-500 text-xs"></i>
                                            <span class="text-xs text-gray-700">Lista de Espera</span>
                                        </div>
                                        <span class="text-xs font-medium ${paciente.listaEspera ? 'text-orange-500' : 'text-green-500'}">
                                            ${paciente.listaEspera ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                </div>

                                <!-- Donante -->
                                <div class="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center space-x-2">
                                            <i class="fas fa-hand-holding-heart text-green-500 text-xs"></i>
                                            <span class="text-xs text-gray-700">Donante de Órganos</span>
                                        </div>
                                        <span class="text-xs font-medium ${paciente.donante ? 'text-green-500' : 'text-gray-500'}">
                                            ${paciente.donante ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        const closeBtn = modal.querySelector('button');
        closeBtn.addEventListener('click', () => modal.remove());

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    abrirFichaClinica(paciente) {
        window.location.href = `registro-clinico.html?id=${paciente.id}`;
    }
}

// Inicializar el gestor de pacientes cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new PacientesManager();
}); 