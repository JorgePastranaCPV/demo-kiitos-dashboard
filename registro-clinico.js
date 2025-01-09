class RegistroClinico {
    constructor() {
        this.paciente = this.obtenerPacienteDeURL();
        this.initializeUI();
        this.initializeEventListeners();
    }

    obtenerPacienteDeURL() {
        const params = new URLSearchParams(window.location.search);
        const pacienteId = params.get('id');
        
        // Obtener paciente del localStorage
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        return citas.find(p => p.id.toString() === pacienteId);
    }

    initializeUI() {
        if (!this.paciente) {
            window.location.href = 'pacientes.html';
            return;
        }

        // Inicializar información del paciente
        document.getElementById('nombrePaciente').textContent = this.paciente.nombre;
        document.getElementById('rutPaciente').textContent = this.paciente.rut;
        document.getElementById('avatarPaciente').textContent = this.paciente.nombre
            .split(' ')
            .map(n => n[0])
            .join('');
        
        // Inicializar fecha y hora
        document.getElementById('fechaHora').textContent = new Date().toLocaleString();
    }

    initializeEventListeners() {
        // Botón guardar
        document.getElementById('guardarRegistro').addEventListener('click', () => this.guardarRegistro());

        // Botón solicitar examen
        document.getElementById('solicitarExamen').addEventListener('click', () => this.solicitarExamen());

        // Botón agregar medicamento
        document.getElementById('agregarMedicamento').addEventListener('click', () => this.agregarMedicamento());
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

    solicitarExamen() {
        const listaExamenes = document.getElementById('listaExamenes');
        const examenes = this.obtenerExamenes();

        // Crear modal para solicitar examen
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-xl bg-white">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Solicitar Examen</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Tipo de Examen</label>
                        <select id="tipoExamen" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                            <option value="Laboratorio">Laboratorio</option>
                            <option value="Imagen">Imagen</option>
                            <option value="Procedimiento">Procedimiento</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Descripción</label>
                        <input type="text" id="descripcionExamen" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" id="cancelarExamen">Cancelar</button>
                        <button class="px-4 py-2 text-sm bg-apple-blue text-white rounded-lg hover:bg-blue-600" id="confirmarExamen">Agregar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para el modal
        modal.querySelector('#cancelarExamen').addEventListener('click', () => modal.remove());
        modal.querySelector('#confirmarExamen').addEventListener('click', () => {
            const tipo = modal.querySelector('#tipoExamen').value;
            const descripcion = modal.querySelector('#descripcionExamen').value;

            if (descripcion) {
                examenes.push({ tipo, descripcion });
                this.actualizarListaExamenes(examenes);
                modal.remove();
            }
        });
    }

    agregarMedicamento() {
        const listaMedicamentos = document.getElementById('listaMedicamentos');
        const medicamentos = this.obtenerMedicamentos();

        // Crear modal para agregar medicamento
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-xl bg-white">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Agregar Medicamento</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Medicamento</label>
                        <input type="text" id="nombreMedicamento" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Dosis</label>
                        <input type="text" id="dosisMedicamento" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Indicaciones</label>
                        <textarea id="indicacionesMedicamento" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-apple-blue focus:border-apple-blue"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" id="cancelarMedicamento">Cancelar</button>
                        <button class="px-4 py-2 text-sm bg-apple-blue text-white rounded-lg hover:bg-blue-600" id="confirmarMedicamento">Agregar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para el modal
        modal.querySelector('#cancelarMedicamento').addEventListener('click', () => modal.remove());
        modal.querySelector('#confirmarMedicamento').addEventListener('click', () => {
            const nombre = modal.querySelector('#nombreMedicamento').value;
            const dosis = modal.querySelector('#dosisMedicamento').value;
            const indicaciones = modal.querySelector('#indicacionesMedicamento').value;

            if (nombre && dosis) {
                medicamentos.push({ nombre, dosis, indicaciones });
                this.actualizarListaMedicamentos(medicamentos);
                modal.remove();
            }
        });
    }

    obtenerExamenes() {
        const examenes = [];
        const items = document.querySelectorAll('#listaExamenes .examen-item');
        items.forEach(item => {
            examenes.push({
                tipo: item.dataset.tipo,
                descripcion: item.dataset.descripcion
            });
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
        if (examenes.length === 0) {
            listaExamenes.innerHTML = `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-file-medical text-gray-400"></i>
                        <span class="text-sm text-gray-600">No hay exámenes solicitados</span>
                    </div>
                </div>
            `;
            return;
        }

        listaExamenes.innerHTML = examenes.map(examen => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg examen-item" 
                data-tipo="${examen.tipo}" 
                data-descripcion="${examen.descripcion}">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-file-medical text-purple-500"></i>
                    <div>
                        <span class="text-sm font-medium text-gray-700">${examen.tipo}</span>
                        <p class="text-sm text-gray-500">${examen.descripcion}</p>
                    </div>
                </div>
                <button class="text-red-400 hover:text-red-600" onclick="this.closest('.examen-item').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    actualizarListaMedicamentos(medicamentos) {
        const listaMedicamentos = document.getElementById('listaMedicamentos');
        if (medicamentos.length === 0) {
            listaMedicamentos.innerHTML = `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-pills text-gray-400"></i>
                        <span class="text-sm text-gray-600">No hay medicamentos recetados</span>
                    </div>
                </div>
            `;
            return;
        }

        listaMedicamentos.innerHTML = medicamentos.map(med => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg medicamento-item"
                data-nombre="${med.nombre}"
                data-dosis="${med.dosis}"
                data-indicaciones="${med.indicaciones}">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-pills text-emerald-500"></i>
                    <div>
                        <span class="text-sm font-medium text-gray-700">${med.nombre}</span>
                        <p class="text-sm text-gray-500">${med.dosis}</p>
                        <p class="text-xs text-gray-400">${med.indicaciones}</p>
                    </div>
                </div>
                <button class="text-red-400 hover:text-red-600" onclick="this.closest('.medicamento-item').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new RegistroClinico();
}); 