class RegistroClinico {
    constructor() {
        // Asegurarse de que el DOM esté cargado antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.paciente = this.obtenerPacienteDeURL();
        this.initializeUI();
        this.initializeEventListeners();
        this.initializeExamenes();
        this.initializeRecetas();
    }

    obtenerPacienteDeURL() {
        const params = new URLSearchParams(window.location.search);
        const pacienteId = params.get('id');
        
        // Obtener paciente del localStorage
        const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        
        // Buscar primero en pacientes y luego en citas
        return pacientes.find(p => p.id.toString() === pacienteId) || 
               citas.find(p => p.id.toString() === pacienteId) || 
               // Datos de ejemplo si no se encuentra el paciente
               {
                   id: 1,
                   nombre: 'Paciente de Ejemplo',
                   rut: '12.345.678-9',
                   edad: 30,
                   telefono: '+56 9 1234 5678'
               };
    }

    initializeUI() {
        // Inicializar información del paciente en el header
        const nombrePaciente = document.getElementById('nombrePaciente');
        const rutPaciente = document.getElementById('rutPaciente');
        const avatarPaciente = document.getElementById('avatarPaciente');
        const fechaHora = document.getElementById('fechaHora');

        if (nombrePaciente) nombrePaciente.textContent = this.paciente.nombre;
        if (rutPaciente) rutPaciente.textContent = this.paciente.rut;
        if (avatarPaciente) {
            avatarPaciente.textContent = this.paciente.nombre
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();
        }
        
        // Inicializar fecha y hora actual
        if (fechaHora) {
            const ahora = new Date();
            fechaHora.textContent = ahora.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Mostrar mensaje de bienvenida en la consola
        console.log('Registro Clínico inicializado para:', this.paciente.nombre);
    }

    initializeEventListeners() {
        // Botón guardar
        const btnGuardar = document.getElementById('guardarRegistro');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarRegistro());
        }

        // Botón agregar medicamento
        const btnMedicamento = document.getElementById('agregarMedicamento');
        if (btnMedicamento) {
            btnMedicamento.addEventListener('click', () => this.abrirModalRecetas());
        }

        // Botón ver historial
        const btnHistorial = document.getElementById('verHistorial');
        if (btnHistorial) {
            btnHistorial.addEventListener('click', () => this.verHistorial());
        }

        // Botón imprimir ficha
        const btnImprimir = document.getElementById('imprimirFicha');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => this.imprimirFicha());
        }
    }

    guardarRegistro() {
        const registro = {
            pacienteId: this.paciente.id,
            fecha: new Date().toISOString(),
            anamnesis: document.getElementById('anamnesis').value,
            examenFisico: document.getElementById('examenFisico').value,
            diagnostico: document.getElementById('diagnostico').value,
            indicaciones: document.getElementById('indicaciones').value,
            examenes: this.obtenerExamenes(),
            medicamentos: this.obtenerMedicamentos()
        };

        // Guardar en localStorage
        const registros = JSON.parse(localStorage.getItem('registros_clinicos') || '[]');
        registros.push(registro);
        localStorage.setItem('registros_clinicos', JSON.stringify(registros));

        // Actualizar estado del paciente
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const index = citas.findIndex(p => p.id === this.paciente.id);
        if (index !== -1) {
            citas[index].estado = 'Atendido';
            localStorage.setItem('citas', JSON.stringify(citas));
        }

        // Redirigir a la lista de pacientes
        window.location.href = 'pacientes.html';
    }

    abrirModalRecetas() {
        this.modalRecetas.classList.remove('hidden');
        this.modalRecetas.classList.add('flex');
        this.mostrarMedicamentosPorCategoria(this.categoriaMedicamentoActual);
        this.actualizarContadorMedicamentos();
    }

    cerrarModalRecetas() {
        this.modalRecetas.classList.remove('flex');
        this.modalRecetas.classList.add('hidden');
        if (this.inputBuscarMedicamento) {
            this.inputBuscarMedicamento.value = '';
        }
        document.getElementById('dosisMedicamento').value = '';
        document.getElementById('duracionMedicamento').value = '';
        document.getElementById('indicacionesMedicamento').value = '';
    }

    mostrarMedicamentosPorCategoria(categoria) {
        if (!this.listaMedicamentosDisponibles) return;

        const iconosPorCategoria = {
            'Analgésicos': 'fa-pills',
            'Antibióticos': 'fa-capsules',
            'Antiinflamatorios': 'fa-tablets',
            'Antialérgicos': 'fa-prescription-bottle-alt'
        };

        const medicamentos = medicamentosPorCategoria[categoria];
        this.listaMedicamentosDisponibles.innerHTML = medicamentos.map(medicamento => `
            <div class="p-3 hover:bg-emerald-50 rounded-lg cursor-pointer transition-all group"
                 onclick="registroClinico.toggleMedicamento('${medicamento.id}', '${medicamento.nombre}', '${medicamento.descripcion}', '${medicamento.presentacion}', '${categoria}')">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <span class="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-600">
                                <i class="fas ${iconosPorCategoria[categoria] || 'fa-prescription-bottle'}"></i>
                            </span>
                            <div>
                                <h4 class="text-sm font-medium text-gray-900 truncate">${medicamento.nombre}</h4>
                                <p class="text-xs text-gray-500 truncate">${medicamento.descripcion}</p>
                                <p class="text-xs text-emerald-600 mt-0.5">${medicamento.presentacion}</p>
                            </div>
                        </div>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                        ${this.medicamentosElegidos.has(medicamento.id) 
                            ? '<span class="text-emerald-500"><i class="fas fa-check-circle"></i></span>'
                            : '<span class="text-gray-400 opacity-0 group-hover:opacity-100"><i class="fas fa-plus-circle"></i></span>'}
                    </div>
                </div>
            </div>
        `).join('');

        // Actualizar estado de los botones de categoría
        document.querySelectorAll('#categoriasMedicamentos button').forEach(btn => {
            const esActual = btn.textContent.trim() === categoria;
            const icono = iconosPorCategoria[btn.textContent.trim()];
            btn.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="w-6 h-6 flex items-center justify-center ${esActual ? 'text-emerald-600' : 'text-gray-400'}">
                        <i class="fas ${icono || 'fa-prescription-bottle'}"></i>
                    </span>
                    <span>${btn.textContent.trim()}</span>
                </div>
            `;
            btn.className = `w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                esActual 
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                    : 'text-gray-600 hover:bg-gray-50'
            } transition-colors`;
        });
    }

    toggleMedicamento(id, nombre, descripcion, presentacion, categoria) {
        if (this.medicamentosElegidos.has(id)) {
            this.medicamentosElegidos.delete(id);
            document.querySelector(`[data-medicamento-id="${id}"]`)?.remove();
        } else {
            this.medicamentosElegidos.add(id);
            const medicamentoElement = document.createElement('div');
            medicamentoElement.className = 'p-3 bg-emerald-50 rounded-lg animate-fade-in';
            medicamentoElement.setAttribute('data-medicamento-id', id);
            medicamentoElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                                <i class="fas ${this.getIconoCategoriaMedicamento(categoria)} mr-1.5"></i>
                                ${categoria}
                            </span>
                            <h4 class="text-sm font-medium text-gray-900 truncate">${nombre}</h4>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 truncate">${descripcion}</p>
                        <p class="text-xs text-emerald-600 mt-0.5">${presentacion}</p>
                    </div>
                    <button onclick="event.stopPropagation(); registroClinico.toggleMedicamento('${id}', '${nombre}', '${descripcion}', '${presentacion}', '${categoria}')"
                            class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            this.medicamentosSeleccionados?.appendChild(medicamentoElement);
        }
        
        this.mostrarMedicamentosPorCategoria(this.categoriaMedicamentoActual);
        this.actualizarContadorMedicamentos();
    }

    getIconoCategoriaMedicamento(categoria) {
        const iconos = {
            'Analgésicos': 'fa-pills',
            'Antibióticos': 'fa-capsules',
            'Antiinflamatorios': 'fa-tablets',
            'Antialérgicos': 'fa-prescription-bottle-alt'
        };
        return iconos[categoria] || 'fa-prescription-bottle';
    }

    actualizarContadorMedicamentos() {
        if (!this.contadorMedicamentos) return;
        
        const cantidad = this.medicamentosElegidos.size;
        this.contadorMedicamentos.textContent = `${cantidad} ${cantidad === 1 ? 'medicamento seleccionado' : 'medicamentos seleccionados'}`;
    }

    buscarMedicamentos(query) {
        if (!query.trim()) {
            this.mostrarMedicamentosPorCategoria(this.categoriaMedicamentoActual);
            return;
        }

        query = query.toLowerCase();
        const resultados = [];
        
        Object.entries(medicamentosPorCategoria).forEach(([categoria, medicamentos]) => {
            medicamentos.forEach(medicamento => {
                if (medicamento.nombre.toLowerCase().includes(query) || 
                    medicamento.descripcion.toLowerCase().includes(query)) {
                    resultados.push({ ...medicamento, categoria });
                }
            });
        });

        if (!this.listaMedicamentosDisponibles) return;

        if (resultados.length === 0) {
            this.listaMedicamentosDisponibles.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-search text-gray-400 text-xl mb-2"></i>
                    <p class="text-sm">No se encontraron medicamentos</p>
                </div>
            `;
            return;
        }

        const iconosPorCategoria = {
            'Analgésicos': 'fa-pills',
            'Antibióticos': 'fa-capsules',
            'Antiinflamatorios': 'fa-tablets',
            'Antialérgicos': 'fa-prescription-bottle-alt'
        };

        this.listaMedicamentosDisponibles.innerHTML = resultados.map(medicamento => `
            <div class="p-3 hover:bg-emerald-50 rounded-lg cursor-pointer transition-all group"
                 onclick="registroClinico.toggleMedicamento('${medicamento.id}', '${medicamento.nombre}', '${medicamento.descripcion}', '${medicamento.presentacion}', '${medicamento.categoria}')">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <span class="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-600">
                                <i class="fas ${iconosPorCategoria[medicamento.categoria] || 'fa-prescription-bottle'}"></i>
                            </span>
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                                        ${medicamento.categoria}
                                    </span>
                                    <h4 class="text-sm font-medium text-gray-900 truncate">${medicamento.nombre}</h4>
                                </div>
                                <p class="text-xs text-gray-500 truncate">${medicamento.descripcion}</p>
                                <p class="text-xs text-emerald-600 mt-0.5">${medicamento.presentacion}</p>
                            </div>
                        </div>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                        ${this.medicamentosElegidos.has(medicamento.id) 
                            ? '<span class="text-emerald-500"><i class="fas fa-check-circle"></i></span>'
                            : '<span class="text-gray-400 opacity-0 group-hover:opacity-100"><i class="fas fa-plus-circle"></i></span>'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    obtenerExamenes() {
        const examenes = [];
        const items = document.querySelectorAll('#listaExamenes > div:not(#estadoInicialExamenes)');
        items.forEach(item => {
            if (item.dataset.examenId) {
                const id = item.dataset.examenId;
                const categoria = item.querySelector('.bg-purple-100')?.textContent?.trim() || '';
                const nombre = item.querySelector('h4')?.textContent?.trim() || '';
                const descripcion = item.querySelector('p')?.textContent?.trim() || '';
                const observaciones = item.querySelector('.bg-gray-50')?.textContent?.trim() || '';
                
                examenes.push({
                    id,
                    categoria,
                    nombre,
                    descripcion,
                    observaciones
                });
            }
        });
        return examenes;
    }

    obtenerMedicamentos() {
        const medicamentos = [];
        const items = document.querySelectorAll('#listaMedicamentos .medicamento-item');
        items.forEach(item => {
            medicamentos.push({
                nombre: item.dataset.nombre,
                dosis: item.dataset.dosis,
                indicaciones: item.dataset.indicaciones
            });
        });
        return medicamentos;
    }

    actualizarListaExamenes(examenes) {
        const listaExamenes = document.getElementById('listaExamenes');
        const estadoInicial = document.getElementById('estadoInicialExamenes');
        
        if (examenes && examenes.length > 0) {
            if (estadoInicial) {
                estadoInicial.style.display = 'none';
            }

            // Limpiar la lista actual
            const elementosExistentes = listaExamenes.querySelectorAll('div:not(#estadoInicialExamenes)');
            elementosExistentes.forEach(el => el.remove());

            examenes.forEach(examen => {
                const examenElement = document.createElement('div');
                examenElement.className = 'p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all list-item';
                examenElement.setAttribute('data-examen-id', examen.id);
                examenElement.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                    ${examen.categoria}
                                </span>
                                <h4 class="text-sm font-medium text-gray-900 truncate">${examen.nombre}</h4>
                            </div>
                            <p class="text-xs text-gray-500 truncate">${examen.descripcion}</p>
                            ${examen.observaciones ? `
                                <div class="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    <i class="fas fa-comment-medical text-gray-400 mr-1"></i>
                                    ${examen.observaciones}
                                </div>
                            ` : ''}
                        </div>
                        <button onclick="registroClinico.eliminarExamen('${examen.id}')"
                                class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                listaExamenes.appendChild(examenElement);
            });
        } else if (estadoInicial) {
            estadoInicial.style.display = 'flex';
        }
    }

    eliminarExamen(id) {
        const examenElement = document.querySelector(`[data-examen-id="${id}"]`);
        if (examenElement) {
            examenElement.classList.add('animate-fade-out');
            setTimeout(() => {
                examenElement.remove();
                this.examenesElegidos.delete(id);
                if (document.querySelectorAll('#listaExamenes > div:not(#estadoInicialExamenes)').length === 0) {
                    document.getElementById('estadoInicialExamenes').style.display = 'flex';
                }
            }, 300);
        }
    }

    actualizarListaMedicamentos(medicamentos) {
        const listaMedicamentos = document.getElementById('listaMedicamentos');
        const estadoInicial = document.getElementById('estadoInicialMedicamentos');
        
        if (medicamentos && medicamentos.length > 0) {
            if (estadoInicial) {
                estadoInicial.style.display = 'none';
            }

            // Limpiar la lista actual
            const elementosExistentes = listaMedicamentos.querySelectorAll('div:not(#estadoInicialMedicamentos)');
            elementosExistentes.forEach(el => el.remove());

            medicamentos.forEach(medicamento => {
                const medicamentoElement = document.createElement('div');
                medicamentoElement.className = 'p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all list-item';
                medicamentoElement.setAttribute('data-medicamento-id', medicamento.id);
                medicamentoElement.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                                    <i class="fas ${this.getIconoCategoriaMedicamento(medicamento.categoria)} mr-1.5"></i>
                                    ${medicamento.categoria}
                                </span>
                                <h4 class="text-sm font-medium text-gray-900 truncate">${medicamento.nombre}</h4>
                            </div>
                            <p class="text-xs text-gray-500 truncate">${medicamento.descripcion}</p>
                            <p class="text-xs text-emerald-600 mt-0.5">${medicamento.presentacion}</p>
                            <div class="mt-2 space-y-1">
                                ${medicamento.dosis ? `
                                    <p class="text-xs text-gray-600">
                                        <i class="fas fa-clock text-gray-400 mr-1"></i>
                                        Dosis: ${medicamento.dosis}
                                    </p>
                                ` : ''}
                                ${medicamento.duracion ? `
                                    <p class="text-xs text-gray-600">
                                        <i class="fas fa-calendar text-gray-400 mr-1"></i>
                                        Duración: ${medicamento.duracion}
                                    </p>
                                ` : ''}
                                ${medicamento.indicaciones ? `
                                    <div class="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        <i class="fas fa-info-circle text-gray-400 mr-1"></i>
                                        ${medicamento.indicaciones}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <button onclick="registroClinico.eliminarMedicamento('${medicamento.id}')"
                                class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                listaMedicamentos.appendChild(medicamentoElement);
            });
        } else if (estadoInicial) {
            estadoInicial.style.display = 'flex';
        }
    }

    eliminarMedicamento(id) {
        const medicamentoElement = document.querySelector(`[data-medicamento-id="${id}"]`);
        if (medicamentoElement) {
            medicamentoElement.classList.add('animate-fade-out');
            setTimeout(() => {
                medicamentoElement.remove();
                this.medicamentosElegidos.delete(id);
                if (document.querySelectorAll('#listaMedicamentos > div:not(#estadoInicialMedicamentos)').length === 0) {
                    document.getElementById('estadoInicialMedicamentos').style.display = 'flex';
                }
            }, 300);
        }
    }

    initializeExamenes() {
        // Inicializar variables para el modal de exámenes
        this.modalExamenes = document.getElementById('modalExamenes');
        this.btnSolicitarExamen = document.getElementById('solicitarExamen');
        this.btnCerrarModalExamenes = document.getElementById('cerrarModalExamenes');
        this.btnCancelarExamenes = document.getElementById('cancelarExamenes');
        this.btnAgregarExamenes = document.getElementById('agregarExamenes');
        this.inputBuscarExamen = document.getElementById('buscarExamen');
        this.categoriasExamenes = document.getElementById('categoriasExamenes');
        this.listaExamenesDisponibles = document.getElementById('listaExamenesDisponibles');
        this.examenesSeleccionados = document.getElementById('examenesSeleccionados');
        this.contadorExamenes = document.getElementById('contadorExamenes');

        this.categoriaActual = 'Laboratorio';
        this.examenesElegidos = new Set();

        // Event Listeners para el modal de exámenes
        this.btnSolicitarExamen?.addEventListener('click', () => this.abrirModalExamenes());
        this.btnCerrarModalExamenes?.addEventListener('click', () => this.cerrarModalExamenes());
        this.btnCancelarExamenes?.addEventListener('click', () => this.cerrarModalExamenes());
        this.inputBuscarExamen?.addEventListener('input', (e) => this.buscarExamenes(e.target.value));

        // Event listeners para las categorías
        document.querySelectorAll('#categoriasExamenes button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.categoriaActual = btn.textContent.trim();
                this.mostrarExamenesPorCategoria(this.categoriaActual);
            });
        });

        // Event listener para agregar exámenes seleccionados
        this.btnAgregarExamenes?.addEventListener('click', () => {
            const observaciones = document.getElementById('observacionesExamen').value;
            const examenes = Array.from(this.examenesElegidos).map(id => {
                const categoria = Object.entries(examenesPorCategoria).find(([_, examenes]) => 
                    examenes.some(e => e.id === id)
                )[0];
                const examen = examenesPorCategoria[categoria].find(e => e.id === id);
                return {
                    id,
                    nombre: examen.nombre,
                    descripcion: examen.descripcion,
                    categoria,
                    observaciones
                };
            });

            this.actualizarListaExamenes(examenes);
            this.cerrarModalExamenes();
        });

        // Inicializar la vista de exámenes
        this.mostrarExamenesPorCategoria(this.categoriaActual);
    }

    abrirModalExamenes() {
        this.modalExamenes.classList.remove('hidden');
        this.modalExamenes.classList.add('flex');
        this.mostrarExamenesPorCategoria(this.categoriaActual);
        this.actualizarContadorExamenes();
    }

    cerrarModalExamenes() {
        this.modalExamenes.classList.remove('flex');
        this.modalExamenes.classList.add('hidden');
        if (this.inputBuscarExamen) {
            this.inputBuscarExamen.value = '';
        }
    }

    mostrarExamenesPorCategoria(categoria) {
        if (!this.listaExamenesDisponibles) return;

        const iconosPorCategoria = {
            'Laboratorio': 'fa-flask',
            'Imagenología': 'fa-x-ray',
            'Cardiología': 'fa-heartbeat',
            'Neurología': 'fa-brain'
        };

        const examenes = examenesPorCategoria[categoria];
        this.listaExamenesDisponibles.innerHTML = examenes.map(examen => `
            <div class="p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all group"
                 onclick="registroClinico.toggleExamen('${examen.id}', '${examen.nombre}', '${examen.descripcion}')">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <span class="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-lg text-purple-600">
                                <i class="fas ${iconosPorCategoria[categoria] || 'fa-microscope'}"></i>
                            </span>
                            <div>
                                <h4 class="text-sm font-medium text-gray-900 truncate">${examen.nombre}</h4>
                                <p class="text-xs text-gray-500 truncate">${examen.descripcion}</p>
                            </div>
                        </div>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                        ${this.examenesElegidos.has(examen.id) 
                            ? '<span class="text-purple-500"><i class="fas fa-check-circle"></i></span>'
                            : '<span class="text-gray-400 opacity-0 group-hover:opacity-100"><i class="fas fa-plus-circle"></i></span>'}
                    </div>
                </div>
            </div>
        `).join('');

        // Actualizar estado de los botones de categoría
        document.querySelectorAll('#categoriasExamenes button').forEach(btn => {
            const esActual = btn.textContent.trim() === categoria;
            const icono = iconosPorCategoria[btn.textContent.trim()];
            btn.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="w-6 h-6 flex items-center justify-center ${esActual ? 'text-purple-600' : 'text-gray-400'}">
                        <i class="fas ${icono || 'fa-microscope'}"></i>
                    </span>
                    <span>${btn.textContent.trim()}</span>
                </div>
            `;
            btn.className = `w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                esActual 
                    ? 'text-purple-700 bg-purple-50 hover:bg-purple-100' 
                    : 'text-gray-600 hover:bg-gray-50'
            } transition-colors`;
        });
    }

    toggleExamen(id, nombre, descripcion, categoria) {
        if (this.examenesElegidos.has(id)) {
            this.examenesElegidos.delete(id);
            document.querySelector(`[data-examen-id="${id}"]`)?.remove();
        } else {
            this.examenesElegidos.add(id);
            const examenElement = document.createElement('div');
            examenElement.className = 'p-3 bg-purple-50 rounded-lg animate-fade-in';
            examenElement.setAttribute('data-examen-id', id);
            examenElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                <i class="fas ${this.getIconoCategoria(this.categoriaActual)} mr-1.5"></i>
                                ${this.categoriaActual}
                            </span>
                            <h4 class="text-sm font-medium text-gray-900 truncate">${nombre}</h4>
                        </div>
                        <p class="text-xs text-gray-500 mt-1 truncate">${descripcion}</p>
                    </div>
                    <button onclick="event.stopPropagation(); registroClinico.toggleExamen('${id}', '${nombre}', '${descripcion}', '${this.categoriaActual}')"
                            class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            this.examenesSeleccionados?.appendChild(examenElement);
        }
        
        this.mostrarExamenesPorCategoria(this.categoriaActual);
        this.actualizarContadorExamenes();
    }

    getIconoCategoria(categoria) {
        const iconos = {
            'Laboratorio': 'fa-flask',
            'Imagenología': 'fa-x-ray',
            'Cardiología': 'fa-heartbeat',
            'Neurología': 'fa-brain'
        };
        return iconos[categoria] || 'fa-microscope';
    }

    actualizarContadorExamenes() {
        if (!this.contadorExamenes) return;
        
        const cantidad = this.examenesElegidos.size;
        this.contadorExamenes.textContent = `${cantidad} ${cantidad === 1 ? 'examen seleccionado' : 'exámenes seleccionados'}`;
    }

    buscarExamenes(query) {
        if (!query.trim()) {
            this.mostrarExamenesPorCategoria(this.categoriaActual);
            return;
        }

        query = query.toLowerCase();
        const resultados = [];
        
        Object.entries(examenesPorCategoria).forEach(([categoria, examenes]) => {
            examenes.forEach(examen => {
                if (examen.nombre.toLowerCase().includes(query) || 
                    examen.descripcion.toLowerCase().includes(query)) {
                    resultados.push({ ...examen, categoria });
                }
            });
        });

        if (!this.listaExamenesDisponibles) return;

        if (resultados.length === 0) {
            this.listaExamenesDisponibles.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-search text-gray-400 text-xl mb-2"></i>
                    <p class="text-sm">No se encontraron exámenes</p>
                </div>
            `;
            return;
        }

        const iconosPorCategoria = {
            'Laboratorio': 'fa-flask',
            'Imagenología': 'fa-x-ray',
            'Cardiología': 'fa-heartbeat',
            'Neurología': 'fa-brain'
        };

        this.listaExamenesDisponibles.innerHTML = resultados.map(examen => `
            <div class="p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all group"
                 onclick="registroClinico.toggleExamen('${examen.id}', '${examen.nombre}', '${examen.descripcion}', '${examen.categoria}')">
                <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                            <span class="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-lg text-purple-600">
                                <i class="fas ${iconosPorCategoria[examen.categoria] || 'fa-microscope'}"></i>
                            </span>
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                        ${examen.categoria}
                                    </span>
                                    <h4 class="text-sm font-medium text-gray-900 truncate">${examen.nombre}</h4>
                                </div>
                                <p class="text-xs text-gray-500 truncate">${examen.descripcion}</p>
                            </div>
                        </div>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                        ${this.examenesElegidos.has(examen.id) 
                            ? '<span class="text-purple-500"><i class="fas fa-check-circle"></i></span>'
                            : '<span class="text-gray-400 opacity-0 group-hover:opacity-100"><i class="fas fa-plus-circle"></i></span>'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    initializeRecetas() {
        // Inicializar variables para el modal de recetas
        this.modalRecetas = document.getElementById('modalRecetas');
        this.btnAgregarMedicamento = document.getElementById('agregarMedicamento');
        this.btnCerrarModalRecetas = document.getElementById('cerrarModalRecetas');
        this.btnCancelarRecetas = document.getElementById('cancelarRecetas');
        this.btnAgregarRecetas = document.getElementById('agregarRecetas');
        this.inputBuscarMedicamento = document.getElementById('buscarMedicamento');
        this.categoriasMedicamentos = document.getElementById('categoriasMedicamentos');
        this.listaMedicamentosDisponibles = document.getElementById('listaMedicamentosDisponibles');
        this.medicamentosSeleccionados = document.getElementById('medicamentosSeleccionados');
        this.contadorMedicamentos = document.getElementById('contadorMedicamentos');

        this.categoriaMedicamentoActual = 'Analgésicos';
        this.medicamentosElegidos = new Set();

        // Event Listeners para el modal de recetas
        this.btnAgregarMedicamento?.addEventListener('click', () => this.abrirModalRecetas());
        this.btnCerrarModalRecetas?.addEventListener('click', () => this.cerrarModalRecetas());
        this.btnCancelarRecetas?.addEventListener('click', () => this.cerrarModalRecetas());
        this.inputBuscarMedicamento?.addEventListener('input', (e) => this.buscarMedicamentos(e.target.value));

        // Event listeners para las categorías
        document.querySelectorAll('#categoriasMedicamentos button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.categoriaMedicamentoActual = btn.textContent.trim();
                this.mostrarMedicamentosPorCategoria(this.categoriaMedicamentoActual);
            });
        });

        // Event listener para agregar medicamentos seleccionados
        this.btnAgregarRecetas?.addEventListener('click', () => {
            const dosis = document.getElementById('dosisMedicamento').value;
            const duracion = document.getElementById('duracionMedicamento').value;
            const indicaciones = document.getElementById('indicacionesMedicamento').value;

            if (this.medicamentosElegidos.size === 0) {
                alert('Por favor, seleccione al menos un medicamento.');
                return;
            }

            if (!dosis.trim()) {
                alert('Por favor, ingrese la dosis del medicamento.');
                return;
            }

            if (!duracion.trim()) {
                alert('Por favor, ingrese la duración del tratamiento.');
                return;
            }

            const medicamentos = Array.from(this.medicamentosElegidos).map(id => {
                const categoria = Object.entries(medicamentosPorCategoria).find(([_, medicamentos]) => 
                    medicamentos.some(m => m.id === id)
                )[0];
                const medicamento = medicamentosPorCategoria[categoria].find(m => m.id === id);
                return {
                    id,
                    nombre: medicamento.nombre,
                    descripcion: medicamento.descripcion,
                    presentacion: medicamento.presentacion,
                    categoria,
                    dosis,
                    duracion,
                    indicaciones: indicaciones.trim()
                };
            });

            this.actualizarListaMedicamentos(medicamentos);
            this.cerrarModalRecetas();
        });

        // Inicializar la vista de medicamentos
        this.mostrarMedicamentosPorCategoria(this.categoriaMedicamentoActual);
    }

    verHistorial() {
        // Remover modal existente si hay uno
        const modalExistente = document.querySelector('.modal-historial');
        if (modalExistente) {
            modalExistente.remove();
        }

        // Obtener registros anteriores del paciente
        const registros = JSON.parse(localStorage.getItem('registros_clinicos') || '[]');
        const historialPaciente = registros.filter(r => r.pacienteId === this.paciente.id);

        // Crear modal para mostrar el historial
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 modal-historial';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-blue-50 rounded-lg">
                                <i class="fas fa-history text-blue-500"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-medium text-gray-800">Log de Consultas</h3>
                                <p class="text-sm text-gray-500 mt-1">Paciente: ${this.paciente.nombre}</p>
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="this.closest('.modal-historial').remove()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="flex-1 p-6 overflow-y-auto">
                    ${historialPaciente.length > 0 ? `
                        <div class="relative">
                            ${historialPaciente.map((registro, index) => `
                                <div class="mb-8 relative">
                                    <!-- Línea de tiempo -->
                                    ${index < historialPaciente.length - 1 ? `
                                        <div class="absolute left-6 top-10 bottom-0 w-0.5 bg-blue-100"></div>
                                    ` : ''}
                                    
                                    <!-- Contenido de la consulta -->
                                    <div class="flex gap-4">
                                        <!-- Indicador de tiempo -->
                                        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                            <i class="fas fa-calendar-day text-blue-500"></i>
                                        </div>
                                        
                                        <!-- Detalles de la consulta -->
                                        <div class="flex-1">
                                            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                <!-- Fecha y hora -->
                                                <div class="flex items-center justify-between mb-3">
                                                    <span class="text-sm font-medium text-blue-600">
                                                        ${new Date(registro.fecha).toLocaleDateString('es-CL', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <span class="text-sm text-gray-500">
                                                        ${new Date(registro.fecha).toLocaleTimeString('es-CL', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>

                                                <!-- Grid de información -->
                                                <div class="grid grid-cols-2 gap-4">
                                                    <!-- Columna izquierda -->
                                                    <div class="space-y-4">
                                                        ${registro.anamnesis ? `
                                                            <div>
                                                                <h4 class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                                    <i class="fas fa-comments text-blue-400 mr-2"></i>
                                                                    Anamnesis
                                                                </h4>
                                                                <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${registro.anamnesis}</p>
                                                            </div>
                                                        ` : ''}
                                                        
                                                        ${registro.examenFisico ? `
                                                            <div>
                                                                <h4 class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                                    <i class="fas fa-stethoscope text-green-400 mr-2"></i>
                                                                    Examen Físico
                                                                </h4>
                                                                <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${registro.examenFisico}</p>
                                                            </div>
                                                        ` : ''}

                                                        ${registro.diagnostico ? `
                                                            <div>
                                                                <h4 class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                                    <i class="fas fa-file-medical text-red-400 mr-2"></i>
                                                                    Diagnóstico
                                                                </h4>
                                                                <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${registro.diagnostico}</p>
                                                            </div>
                                                        ` : ''}
                                                    </div>

                                                    <!-- Columna derecha -->
                                                    <div class="space-y-4">
                                                        ${registro.indicaciones ? `
                                                            <div>
                                                                <h4 class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                                    <i class="fas fa-list-ul text-yellow-400 mr-2"></i>
                                                                    Indicaciones
                                                                </h4>
                                                                <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${registro.indicaciones}</p>
                                                            </div>
                                                        ` : ''}

                                                        ${registro.examenes?.length > 0 ? `
                                                            <div>
                                                                <h4 class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                                    <i class="fas fa-microscope text-purple-400 mr-2"></i>
                                                                    Exámenes Solicitados
                                                                </h4>
                                                                <div class="bg-gray-50 p-2 rounded">
                                                                    ${registro.examenes.map(examen => `
                                                                        <div class="flex items-center space-x-2 mb-1 last:mb-0">
                                                                            <span class="w-2 h-2 bg-purple-400 rounded-full"></span>
                                                                            <span class="text-sm text-gray-600">${examen.nombre}</span>
                                                                        </div>
                                                                    `).join('')}
                                                                </div>
                                                            </div>
                                                        ` : ''}

                                                        ${registro.medicamentos?.length > 0 ? `
                                                            <div>
                                                                <h4 class="text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                                    <i class="fas fa-prescription text-emerald-400 mr-2"></i>
                                                                    Medicamentos Recetados
                                                                </h4>
                                                                <div class="bg-gray-50 p-2 rounded">
                                                                    ${registro.medicamentos.map(med => `
                                                                        <div class="mb-2 last:mb-0">
                                                                            <div class="flex items-center space-x-2">
                                                                                <span class="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                                                                <span class="text-sm font-medium text-gray-700">${med.nombre}</span>
                                                                            </div>
                                                                            <div class="ml-4 text-xs text-gray-600">
                                                                                <span class="inline-block mr-2">
                                                                                    <i class="fas fa-clock text-gray-400 mr-1"></i>
                                                                                    ${med.dosis}
                                                                                </span>
                                                                                ${med.duracion ? `
                                                                                    <span class="inline-block">
                                                                                        <i class="fas fa-calendar text-gray-400 mr-1"></i>
                                                                                        ${med.duracion}
                                                                                    </span>
                                                                                ` : ''}
                                                                            </div>
                                                                        </div>
                                                                    `).join('')}
                                                                </div>
                                                            </div>
                                                        ` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-folder-open text-gray-400 text-2xl"></i>
                            </div>
                            <h3 class="text-gray-500 font-medium">No hay registros clínicos anteriores</h3>
                            <p class="text-gray-400 text-sm mt-1">Este es el primer registro del paciente</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    imprimirFicha() {
        const ventanaImpresion = window.open('', '_blank');
        
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ficha Clínica - ${this.paciente.nombre}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap');
                    
                    body {
                        font-family: 'Open Sans', sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        color: #374151;
                    }

                    .page {
                        padding: 2.5cm;
                        max-width: 21cm;
                        margin: 0 auto;
                        background: #fff;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }

                    .header {
                        text-align: center;
                        margin-bottom: 2em;
                        padding-bottom: 1em;
                        border-bottom: 2px solid #e5e7eb;
                        position: relative;
                    }

                    .header::after {
                        content: '';
                        position: absolute;
                        bottom: -2px;
                        left: 30%;
                        right: 30%;
                        height: 2px;
                        background: #3b82f6;
                    }

                    .header h1 {
                        font-size: 24px;
                        font-weight: 600;
                        color: #1f2937;
                        margin-bottom: 0.5em;
                    }

                    .patient-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2em;
                        padding: 1em;
                        background: #f3f4f6;
                        border-radius: 8px;
                    }

                    .patient-info div {
                        flex: 1;
                    }

                    .patient-info label {
                        font-weight: 600;
                        color: #4b5563;
                        display: block;
                        margin-bottom: 0.25em;
                        font-size: 0.9em;
                    }

                    .patient-info span {
                        color: #374151;
                        font-size: 0.95em;
                    }

                    .section {
                        margin-bottom: 1.5em;
                        page-break-inside: avoid;
                    }

                    .section-title {
                        font-weight: 600;
                        margin-bottom: 0.75em;
                        color: #1f2937;
                        display: flex;
                        align-items: center;
                        font-size: 1.1em;
                    }

                    .section-title i {
                        margin-right: 0.5em;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 6px;
                    }

                    .content {
                        background: #f9fafb;
                        padding: 1em;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;
                    }

                    .content p {
                        margin: 0;
                        line-height: 1.6;
                    }

                    .content ul {
                        margin: 0;
                        padding-left: 1.5em;
                    }

                    .content li {
                        margin-bottom: 0.5em;
                    }

                    .footer {
                        margin-top: 3em;
                        padding-top: 1em;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        font-size: 0.9em;
                        color: #6b7280;
                    }

                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        .page {
                            box-shadow: none;
                            margin: 0;
                            padding: 2cm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <h1>Ficha Clínica</h1>
                    </div>

                    <div class="patient-info">
                        <div>
                            <label>Paciente</label>
                            <span>${this.paciente.nombre}</span>
                        </div>
                        <div>
                            <label>RUT</label>
                            <span>${this.paciente.rut}</span>
                        </div>
                        <div>
                            <label>Fecha</label>
                            <span>${new Date().toLocaleDateString('es-CL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-comments" style="background: #dbeafe; color: #2563eb;"></i>
                            Anamnesis
                        </div>
                        <div class="content">
                            <p>${document.getElementById('anamnesis').value || 'Sin registro'}</p>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-stethoscope" style="background: #dcfce7; color: #16a34a;"></i>
                            Examen Físico
                        </div>
                        <div class="content">
                            <p>${document.getElementById('examenFisico').value || 'Sin registro'}</p>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-file-medical" style="background: #fee2e2; color: #dc2626;"></i>
                            Diagnóstico
                        </div>
                        <div class="content">
                            <p>${document.getElementById('diagnostico').value || 'Sin registro'}</p>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-list-ul" style="background: #fef3c7; color: #d97706;"></i>
                            Indicaciones
                        </div>
                        <div class="content">
                            <p>${document.getElementById('indicaciones').value || 'Sin registro'}</p>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-microscope" style="background: #f3e8ff; color: #7e22ce;"></i>
                            Exámenes Solicitados
                        </div>
                        <div class="content">
                            ${this.obtenerExamenes().length > 0 ? `
                                <ul>
                                    ${this.obtenerExamenes().map(examen => `
                                        <li>
                                            <strong>${examen.nombre}</strong>
                                            ${examen.descripcion ? `<br><span style="font-size: 0.9em; color: #6b7280;">${examen.descripcion}</span>` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p>Sin exámenes solicitados</p>'}
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">
                            <i class="fas fa-prescription" style="background: #d1fae5; color: #059669;"></i>
                            Medicamentos Recetados
                        </div>
                        <div class="content">
                            ${this.obtenerMedicamentos().length > 0 ? `
                                <ul>
                                    ${this.obtenerMedicamentos().map(med => `
                                        <li>
                                            <strong>${med.nombre}</strong>
                                            ${med.dosis ? `<br><span style="font-size: 0.9em; color: #6b7280;">Dosis: ${med.dosis}</span>` : ''}
                                            ${med.duracion ? `<br><span style="font-size: 0.9em; color: #6b7280;">Duración: ${med.duracion}</span>` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p>Sin medicamentos recetados</p>'}
                        </div>
                    </div>

                    <div class="footer">
                        <p>Documento generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}</p>
                    </div>
                </div>
            </body>
            </html>
        `);

        ventanaImpresion.document.close();
        ventanaImpresion.print();
    }
}

// Manejador del modal CIE-10
const modalCIE10 = document.getElementById('modalCIE10');
const btnAgregarCIE10 = document.getElementById('agregarCIE10');
const btnCerrarModalCIE10 = document.getElementById('cerrarModalCIE10');
const btnCancelarDiagnostico = document.getElementById('cancelarDiagnostico');
const btnAgregarDiagnostico = document.getElementById('agregarDiagnostico');
const inputBuscarCIE10 = document.getElementById('buscarCIE10');
const resultadosCIE10 = document.getElementById('resultadosCIE10');
const diagnosticoLibre = document.getElementById('diagnosticoLibre');
const listaCIE10 = document.getElementById('listaCIE10');

// Base de datos simulada de códigos CIE-10 (deberías reemplazar esto con una API real)
const codigosCIE10 = [
    { codigo: 'J00', descripcion: 'Rinofaringitis aguda [resfriado común]' },
    { codigo: 'J01', descripcion: 'Sinusitis aguda' },
    { codigo: 'J02', descripcion: 'Faringitis aguda' },
    { codigo: 'J03', descripcion: 'Amigdalitis aguda' },
    { codigo: 'J04', descripcion: 'Laringitis y traqueítis agudas' },
    { codigo: 'J05', descripcion: 'Laringitis obstructiva aguda [crup] y epiglotitis' },
];

// Funciones para abrir y cerrar el modal
function abrirModal() {
    modalCIE10.classList.remove('hidden');
    modalCIE10.classList.add('flex');
    inputBuscarCIE10.focus();
}

function cerrarModal() {
    modalCIE10.classList.remove('flex');
    modalCIE10.classList.add('hidden');
    inputBuscarCIE10.value = '';
    diagnosticoLibre.value = '';
    mostrarResultados(codigosCIE10);
}

// Función para buscar códigos CIE-10
function buscarCIE10(query) {
    if (!query) return codigosCIE10;
    
    query = query.toLowerCase();
    const resultados = codigosCIE10.filter(item => 
        item.codigo.toLowerCase().includes(query) || 
        item.descripcion.toLowerCase().includes(query)
    );

    return resultados;
}

// Función para mostrar resultados de búsqueda
function mostrarResultados(resultados) {
    resultadosCIE10.innerHTML = resultados.map(item => `
        <div class="p-4 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-between group"
             onclick="seleccionarCIE10('${item.codigo}', '${item.descripcion}')">
            <div class="flex items-center space-x-3 min-w-0">
                <span class="inline-flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium shrink-0">
                    ${item.codigo}
                </span>
                <span class="text-sm text-gray-600 truncate">${item.descripcion}</span>
            </div>
            <span class="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-plus-circle"></i>
            </span>
        </div>
    `).join('');

    // Si no hay resultados, mostrar mensaje
    if (resultados.length === 0) {
        resultadosCIE10.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <i class="fas fa-search text-gray-400 text-xl mb-2"></i>
                <p class="text-sm">No se encontraron resultados</p>
            </div>
        `;
    }
}

// Función para seleccionar un código CIE-10
function seleccionarCIE10(codigo, descripcion) {
    const estadoInicial = document.getElementById('estadoInicial');
    if (estadoInicial) {
        estadoInicial.style.display = 'none';
    }

    const diagnosticoElement = document.createElement('div');
    diagnosticoElement.className = 'flex items-center justify-between p-2 bg-blue-50 rounded-lg animate-fade-in group';
    diagnosticoElement.innerHTML = `
        <div class="flex items-center space-x-3 min-w-0">
            <span class="inline-flex items-center px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium shrink-0">
                <i class="fas fa-tag text-xs mr-1.5"></i>
                ${codigo}
            </span>
            <span class="text-sm text-gray-600 truncate">${descripcion}</span>
        </div>
        <button class="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" 
                onclick="eliminarDiagnostico(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    listaCIE10.appendChild(diagnosticoElement);
    cerrarModal();
}

// Función para agregar diagnóstico libre
function agregarDiagnosticoLibre(texto) {
    if (!texto.trim()) return;
    
    const estadoInicial = document.getElementById('estadoInicial');
    if (estadoInicial) {
        estadoInicial.style.display = 'none';
    }

    const diagnosticoElement = document.createElement('div');
    diagnosticoElement.className = 'flex items-center justify-between p-2 bg-gray-50 rounded-lg animate-fade-in';
    diagnosticoElement.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">
                <i class="fas fa-file-medical text-xs mr-1"></i>
                Libre
            </span>
            <span class="text-sm text-gray-600">${texto}</span>
        </div>
        <button class="text-gray-400 hover:text-red-500 transition-colors" onclick="eliminarDiagnostico(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    listaCIE10.appendChild(diagnosticoElement);
}

// Función para eliminar diagnóstico
function eliminarDiagnostico(button) {
    const diagnostico = button.closest('div[class*="flex items-center justify-between"]');
    diagnostico.classList.add('animate-fade-out');
    
    setTimeout(() => {
        diagnostico.remove();
        
        // Mostrar mensaje inicial si no hay diagnósticos
        const listaCIE10 = document.getElementById('listaCIE10');
        const diagnosticos = listaCIE10.querySelectorAll('div[class*="flex items-center justify-between"]');
        const estadoInicial = document.getElementById('estadoInicial');
        
        if (diagnosticos.length === 0 && estadoInicial) {
            estadoInicial.style.display = 'flex';
        }
    }, 200);
}

// Agregar estilos de animación al head
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    
    .animate-fade-out {
        animation: fadeOut 0.2s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Event Listeners
btnAgregarCIE10.addEventListener('click', abrirModal);
btnCerrarModalCIE10.addEventListener('click', cerrarModal);
btnCancelarDiagnostico.addEventListener('click', cerrarModal);

inputBuscarCIE10.addEventListener('input', (e) => {
    const resultados = buscarCIE10(e.target.value);
    mostrarResultados(resultados);
});

btnAgregarDiagnostico.addEventListener('click', () => {
    if (diagnosticoLibre.value.trim()) {
        agregarDiagnosticoLibre(diagnosticoLibre.value);
    }
    cerrarModal();
});

// Inicialización
mostrarResultados(codigosCIE10);

// Cerrar modal con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalCIE10.classList.contains('hidden')) {
        cerrarModal();
    }
});

// Cerrar modal al hacer clic fuera
modalCIE10.addEventListener('click', (e) => {
    if (e.target === modalCIE10) {
        cerrarModal();
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new RegistroClinico();
});

// Base de datos simulada de exámenes por categoría
const examenesPorCategoria = {
    'Laboratorio': [
        { id: 'lab1', nombre: 'Hemograma completo', descripcion: 'Análisis completo de células sanguíneas' },
        { id: 'lab2', nombre: 'Perfil bioquímico', descripcion: 'Evaluación de función hepática y renal' },
        { id: 'lab3', nombre: 'Perfil lipídico', descripcion: 'Medición de colesterol y triglicéridos' },
        { id: 'lab4', nombre: 'Glicemia', descripcion: 'Medición de glucosa en sangre' },
        { id: 'lab5', nombre: 'Hemoglobina glicosilada', descripcion: 'Control de diabetes' }
    ],
    'Imagenología': [
        { id: 'img1', nombre: 'Radiografía de tórax', descripcion: 'Imagen de pulmones y caja torácica' },
        { id: 'img2', nombre: 'Ecografía abdominal', descripcion: 'Evaluación de órganos abdominales' },
        { id: 'img3', nombre: 'TAC de cerebro', descripcion: 'Tomografía computarizada cerebral' },
        { id: 'img4', nombre: 'Resonancia magnética', descripcion: 'Estudio detallado de tejidos blandos' }
    ],
    'Cardiología': [
        { id: 'car1', nombre: 'Electrocardiograma', descripcion: 'Registro de actividad eléctrica del corazón' },
        { id: 'car2', nombre: 'Ecocardiograma', descripcion: 'Imagen del corazón y su funcionamiento' },
        { id: 'car3', nombre: 'Test de esfuerzo', descripcion: 'Evaluación cardíaca durante ejercicio' }
    ],
    'Neurología': [
        { id: 'neu1', nombre: 'Electroencefalograma', descripcion: 'Registro de actividad cerebral' },
        { id: 'neu2', nombre: 'Electromiografía', descripcion: 'Estudio de función muscular y nervios' },
        { id: 'neu3', nombre: 'Potenciales evocados', descripcion: 'Evaluación de vías nerviosas' }
    ]
};

// Base de datos simulada de medicamentos por categoría
const medicamentosPorCategoria = {
    'Analgésicos': [
        { id: 'ana1', nombre: 'Paracetamol', descripcion: 'Analgésico y antipirético', presentacion: 'Tabletas 500mg' },
        { id: 'ana2', nombre: 'Ibuprofeno', descripcion: 'Antiinflamatorio no esteroideo', presentacion: 'Tabletas 400mg' },
        { id: 'ana3', nombre: 'Tramadol', descripcion: 'Analgésico opioide', presentacion: 'Tabletas 50mg' }
    ],
    'Antibióticos': [
        { id: 'atb1', nombre: 'Amoxicilina', descripcion: 'Antibiótico betalactámico', presentacion: 'Cápsulas 500mg' },
        { id: 'atb2', nombre: 'Azitromicina', descripcion: 'Antibiótico macrólido', presentacion: 'Tabletas 500mg' },
        { id: 'atb3', nombre: 'Ciprofloxacino', descripcion: 'Antibiótico fluoroquinolona', presentacion: 'Tabletas 500mg' }
    ],
    'Antiinflamatorios': [
        { id: 'aine1', nombre: 'Naproxeno', descripcion: 'Antiinflamatorio no esteroideo', presentacion: 'Tabletas 550mg' },
        { id: 'aine2', nombre: 'Diclofenaco', descripcion: 'Antiinflamatorio no esteroideo', presentacion: 'Tabletas 50mg' },
        { id: 'aine3', nombre: 'Celecoxib', descripcion: 'Inhibidor selectivo COX-2', presentacion: 'Cápsulas 200mg' }
    ],
    'Antialérgicos': [
        { id: 'alg1', nombre: 'Loratadina', descripcion: 'Antihistamínico no sedante', presentacion: 'Tabletas 10mg' },
        { id: 'alg2', nombre: 'Cetirizina', descripcion: 'Antihistamínico de segunda generación', presentacion: 'Tabletas 10mg' },
        { id: 'alg3', nombre: 'Desloratadina', descripcion: 'Antihistamínico no sedante', presentacion: 'Tabletas 5mg' }
    ]
};

// Crear instancia global para acceder desde los eventos onclick
let registroClinico;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    registroClinico = new RegistroClinico();
}); 