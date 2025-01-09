class AgendaManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.horarios = this.loadHorarios();
        
        // Cargar profesionales guardados
        const savedProfesionales = localStorage.getItem('profesionales');
        if (savedProfesionales) {
            this.profesionalesHorarios = JSON.parse(savedProfesionales);
        } else {
            // Si no hay profesionales guardados, usar los predeterminados
            this.profesionalesHorarios = {
                'Dr. Juan Pérez': { 
                    inicio: '08:00', 
                    fin: '14:00', 
                    dias: [1,2,3,4,5],
                    especialidad: 'Medicina General',
                    sucursal: 'Clínica San Carlos'
                },
                'Dra. María González': { 
                    inicio: '14:00', 
                    fin: '19:00', 
                    dias: [1,3,5],
                    especialidad: 'Pediatría',
                    sucursal: 'Centro Médico Las Condes'
                },
                'Dr. Carlos Rodríguez': { 
                    inicio: '08:00', 
                    fin: '13:00', 
                    dias: [2,4],
                    especialidad: 'Cardiología',
                    sucursal: 'Hospital del Valle'
                },
                'Dra. Ana Martínez': { 
                    inicio: '15:00', 
                    fin: '19:00', 
                    dias: [1,2,3,4,5],
                    especialidad: 'Ginecología',
                    sucursal: 'Clínica Santa María'
                },
                'Dr. Luis Sánchez': { 
                    inicio: '08:00', 
                    fin: '19:00', 
                    dias: [1,3,5],
                    especialidad: 'Traumatología',
                    sucursal: 'Centro Médico San José'
                }
            };
            localStorage.setItem('profesionales', JSON.stringify(this.profesionalesHorarios));
        }
        
        this.initializeCalendar();
        this.updateSelectedDateDisplay();
        this.initializeEventListeners();
        this.actualizarSelectoresFiltro(); // Actualizar selectores al inicio
        this.renderHorarios();
        this.renderTablaPacientes();
        this.setupMantenedor();
    }

    setupMantenedor() {
        const mantenedorBtn = document.createElement('button');
        mantenedorBtn.className = 'p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors ml-2 flex items-center justify-center';
        mantenedorBtn.style.marginTop = '2px';
        mantenedorBtn.title = 'Gestionar Profesionales';
        mantenedorBtn.innerHTML = '<i class="fas fa-cog text-sm"></i>';
        mantenedorBtn.addEventListener('click', () => this.mostrarMantenedor());

        // Agregar botón después del título "RESERVAR UNA HORA"
        const titulo = document.querySelector('h2.text-xl.font-bold');
        if (titulo) {
            const contenedorTitulo = document.createElement('div');
            contenedorTitulo.className = 'flex items-center mb-6';
            titulo.classList.remove('mb-6');
            
            // Mover el título existente al nuevo contenedor
            titulo.parentNode.insertBefore(contenedorTitulo, titulo);
            contenedorTitulo.appendChild(titulo);
            contenedorTitulo.appendChild(mantenedorBtn);
        }
    }

    mostrarMantenedor() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-medium">Gestión de Profesionales</h3>
                    <button class="text-gray-500 hover:text-gray-700" id="closeMantenedor">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" id="agregarProfesional">
                        <i class="fas fa-plus mr-2"></i>Nuevo Profesional
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="tablaProfesionales">
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('#closeMantenedor').addEventListener('click', () => modal.remove());

        // Agregar nuevo profesional
        modal.querySelector('#agregarProfesional').addEventListener('click', () => {
            this.editarProfesional();
        });

        this.renderTablaProfesionales(modal.querySelector('#tablaProfesionales'));
    }

    renderTablaProfesionales(container) {
        container.innerHTML = '';
        
        Object.entries(this.profesionalesHorarios).forEach(([nombre, datos]) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${nombre}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${datos.especialidad}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${datos.sucursal}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${datos.inicio} - ${datos.fin}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${this.getDiasTexto(datos.dias)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button class="text-blue-600 hover:text-blue-800 mx-2" onclick="agendaManager.editarProfesional('${nombre}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800 mx-2" onclick="agendaManager.eliminarProfesional('${nombre}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            container.appendChild(tr);
        });
    }

    getDiasTexto(dias) {
        const nombresDias = {
            1: 'Lun',
            2: 'Mar',
            3: 'Mié',
            4: 'Jue',
            5: 'Vie'
        };
        return dias.map(d => nombresDias[d]).join(', ');
    }

    editarProfesional(nombreExistente = null) {
        const profesional = nombreExistente ? this.profesionalesHorarios[nombreExistente] : null;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-medium mb-4">${nombreExistente ? 'Editar' : 'Nuevo'} Profesional</h3>
                <form id="formProfesional" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input type="text" name="nombre" required class="w-full border rounded p-2" 
                            value="${nombreExistente || ''}" ${nombreExistente ? 'readonly' : ''}>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                        <select name="especialidad" required class="w-full border rounded p-2">
                            <option value="">-- Seleccionar --</option>
                            <option value="Medicina General">Medicina General</option>
                            <option value="Pediatría">Pediatría</option>
                            <option value="Ginecología">Ginecología</option>
                            <option value="Cardiología">Cardiología</option>
                            <option value="Dermatología">Dermatología</option>
                            <option value="Traumatología">Traumatología</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                        <select name="sucursal" required class="w-full border rounded p-2">
                            <option value="">-- Seleccionar --</option>
                            <option value="Clínica San Carlos">Clínica San Carlos</option>
                            <option value="Centro Médico Las Condes">Centro Médico Las Condes</option>
                            <option value="Hospital del Valle">Hospital del Valle</option>
                            <option value="Clínica Santa María">Clínica Santa María</option>
                            <option value="Centro Médico San José">Centro Médico San José</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                            <input type="time" name="inicio" required class="w-full border rounded p-2"
                                value="${profesional ? profesional.inicio : '08:00'}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                            <input type="time" name="fin" required class="w-full border rounded p-2"
                                value="${profesional ? profesional.fin : '17:00'}">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Días de atención</label>
                        <div class="flex space-x-4">
                            <label class="flex items-center">
                                <input type="checkbox" name="dias" value="1" class="mr-2"> Lun
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="dias" value="2" class="mr-2"> Mar
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="dias" value="3" class="mr-2"> Mié
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="dias" value="4" class="mr-2"> Jue
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="dias" value="5" class="mr-2"> Vie
                            </label>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Si estamos editando, establecer valores actuales
        if (profesional) {
            const form = modal.querySelector('form');
            form.querySelector('[name="especialidad"]').value = profesional.especialidad;
            form.querySelector('[name="sucursal"]').value = profesional.sucursal;
            profesional.dias.forEach(dia => {
                form.querySelector(`[name="dias"][value="${dia}"]`).checked = true;
            });
        }

        modal.querySelector('button[type="button"]').addEventListener('click', () => modal.remove());

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const nombre = formData.get('nombre');
            const diasSeleccionados = [...formData.getAll('dias')].map(Number);
            
            if (diasSeleccionados.length === 0) {
                alert('Debe seleccionar al menos un día de atención');
                return;
            }

            this.profesionalesHorarios[nombre] = {
                especialidad: formData.get('especialidad'),
                sucursal: formData.get('sucursal'),
                inicio: formData.get('inicio'),
                fin: formData.get('fin'),
                dias: diasSeleccionados
            };

            // Guardar cambios
            localStorage.setItem('profesionales', JSON.stringify(this.profesionalesHorarios));
            
            // Actualizar vistas
            this.renderTablaProfesionales(document.getElementById('tablaProfesionales'));
            this.actualizarSelectoresFiltro();
            
            // Mostrar confirmación
            this.mostrarConfirmacion(null, `Profesional ${nombreExistente ? 'actualizado' : 'agregado'} correctamente`);
            
            modal.remove();
        });
    }

    eliminarProfesional(nombre) {
        if (confirm(`¿Está seguro que desea eliminar al profesional ${nombre}?`)) {
            delete this.profesionalesHorarios[nombre];
            localStorage.setItem('profesionales', JSON.stringify(this.profesionalesHorarios));
            
            // Actualizar vista
            this.renderTablaProfesionales(document.getElementById('tablaProfesionales'));
            this.actualizarSelectoresFiltro();
        }
    }

    actualizarSelectoresFiltro() {
        // Actualizar selector de profesionales
        const selectorProfesional = document.getElementById('profesional');
        const profesionalActual = selectorProfesional.value;
        
        selectorProfesional.innerHTML = '<option value="">-- Seleccionar --</option>';
        Object.entries(this.profesionalesHorarios).forEach(([nombre, datos]) => {
            const selected = nombre === profesionalActual ? 'selected' : '';
            selectorProfesional.innerHTML += `<option value="${nombre}" ${selected}>${nombre}</option>`;
        });

        // Actualizar selector de especialidades
        const selectorEspecialidad = document.getElementById('especialidad');
        const especialidadActual = selectorEspecialidad.value;
        
        const especialidades = [...new Set(Object.values(this.profesionalesHorarios).map(p => p.especialidad))];
        selectorEspecialidad.innerHTML = '<option value="">-- Seleccionar --</option>';
        especialidades.forEach(especialidad => {
            const selected = especialidad === especialidadActual ? 'selected' : '';
            selectorEspecialidad.innerHTML += `<option value="${especialidad}" ${selected}>${especialidad}</option>`;
        });

        // Actualizar selector de sucursales
        const selectorSucursal = document.getElementById('sucursal');
        const sucursalActual = selectorSucursal.value;
        
        const sucursales = [...new Set(Object.values(this.profesionalesHorarios).map(p => p.sucursal))];
        selectorSucursal.innerHTML = '<option value="">-- Seleccionar --</option>';
        sucursales.forEach(sucursal => {
            const selected = sucursal === sucursalActual ? 'selected' : '';
            selectorSucursal.innerHTML += `<option value="${sucursal}" ${selected}>${sucursal}</option>`;
        });

        // Actualizar la vista de horarios
        this.renderHorarios();
    }

    loadHorarios() {
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const key = `horarios_${fecha}`;
        const savedHorarios = localStorage.getItem(key);
        if (savedHorarios) {
            return JSON.parse(savedHorarios);
        }

        // Generar horarios desde 8:00 hasta 19:00 con intervalos de 15 minutos
        const horarios = {};
        for (let hora = 8; hora < 19; hora++) {
            for (let minuto = 0; minuto < 60; minuto += 15) {
                const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
                horarios[horaStr] = { estado: "disponible" };
            }
        }
        return horarios;
    }

    saveHorarios() {
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const key = `horarios_${fecha}`;
        localStorage.setItem(key, JSON.stringify(this.horarios));
    }

    saveCita(hora, datosFormulario) {
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        
        const nuevaCita = {
            id: Date.now(),
            fecha: fecha,
            hora: hora,
            nombre: datosFormulario.get('nombre'),
            rut: datosFormulario.get('rut'),
            prevision: datosFormulario.get('prevision'),
            estado: 'En espera',
            profesional: document.getElementById('profesional').value || 'Dr. Juan Pérez',
            consulta: document.getElementById('especialidad').value || 'Medicina General',
            duracion: '15',
            medioAtencion: document.getElementById('medioAtencion').value,
            sucursal: document.getElementById('sucursal').value
        };

        // Verificar si ya existe una cita en esa fecha y hora
        const citaExistente = citas.find(c => c.fecha === fecha && c.hora === hora);
        if (citaExistente) {
            alert('Ya existe una cita reservada para esta fecha y hora');
            return false;
        }

        // Verificar que se hayan seleccionado los campos requeridos
        if (!nuevaCita.profesional || !nuevaCita.consulta || !nuevaCita.sucursal) {
            alert('Por favor seleccione la sucursal, especialidad y profesional');
            return false;
        }

        citas.push(nuevaCita);
        localStorage.setItem('citas', JSON.stringify(citas));

        // Actualizar la tabla de pacientes
        this.renderTablaPacientes();
        return true;
    }

    initializeCalendar() {
        const calendarContainer = document.getElementById('calendar-days');
        calendarContainer.innerHTML = '';
        
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // Agregar días vacíos al principio
        const firstDayOfWeek = firstDay.getDay() || 7;
        for (let i = 1; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            calendarContainer.appendChild(emptyDay);
        }

        // Agregar los días del mes
        for (let date = 1; date <= lastDay.getDate(); date++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date;

            const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), date);
            
            if (this.isSameDay(currentDate, new Date())) {
                dayElement.classList.add('today');
            }

            if (this.isSameDay(currentDate, this.selectedDate)) {
                dayElement.classList.add('selected');
            }

            if (currentDate < new Date().setHours(0,0,0,0)) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(currentDate));
            }

            calendarContainer.appendChild(dayElement);
        }

        // Actualizar el título del mes
        document.getElementById('currentMonth').textContent = 
            `${this.currentDate.toLocaleString('es', { month: 'long' }).toUpperCase()} ${this.currentDate.getFullYear()}`;
    }

    selectDate(date) {
        this.selectedDate = date;
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
            if (day.textContent === date.getDate().toString()) {
                day.classList.add('selected');
            }
        });
        this.updateSelectedDateDisplay();
        this.horarios = this.loadHorarios();
        this.renderHorarios();
        this.renderTablaPacientes();
    }

    updateSelectedDateDisplay() {
        const dayName = this.selectedDate.toLocaleString('es', { weekday: 'long' }).toUpperCase();
        const dayNumber = this.selectedDate.getDate().toString().padStart(2, '0');
        document.getElementById('selectedDate').textContent = `DÍA ${dayName} ${dayNumber}`;
    }

    renderHorarios() {
        const container = document.getElementById('horas-disponibles');
        container.innerHTML = '';
        
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const citasDelDia = citas.filter(c => c.fecha === fecha);
        const profesionalSeleccionado = document.getElementById('profesional').value;
        const especialidadSeleccionada = document.getElementById('especialidad').value;

        // Actualizar estado de horarios según citas existentes
        citasDelDia.forEach(cita => {
            if (this.horarios[cita.hora]) {
                this.horarios[cita.hora].estado = 'ocupado';
            }
        });

        let horasDisponibles = 0;
        
        Object.entries(this.horarios).forEach(([hora, info]) => {
            // Si hay un profesional seleccionado, verificar disponibilidad
            if (profesionalSeleccionado) {
                const horaDisponibleParaProfesional = this.isHorarioDisponibleParaProfesional(hora, profesionalSeleccionado);
                if (!horaDisponibleParaProfesional) {
                    return; // No mostrar esta hora si está fuera del horario del profesional
                }
            } else {
                return; // No mostrar horarios si no hay profesional seleccionado
            }

            const horaDiv = document.createElement('div');
            horaDiv.className = `hora-disponible ${info.estado === 'ocupado' ? 'hora-ocupada' : ''}`;
            
            // Ocultar horas ocupadas por defecto
            if (info.estado === 'ocupado') {
                horaDiv.style.display = 'none';
            } else {
                horasDisponibles++; // Incrementar solo si la hora está disponible y dentro del horario del profesional
            }
            
            const citaActual = citasDelDia.find(c => c.hora === hora);

            // Si hay una cita y hay filtros activos, verificar que coincidan
            if (citaActual) {
                if (profesionalSeleccionado && citaActual.profesional !== profesionalSeleccionado) {
                    horasDisponibles--; // Decrementar si la hora está ocupada por otro profesional
                    return; // No mostrar si no coincide con el profesional seleccionado
                }
                if (especialidadSeleccionada && citaActual.consulta !== especialidadSeleccionada) {
                    horasDisponibles--; // Decrementar si la hora está ocupada por otra especialidad
                    return; // No mostrar si no coincide con la especialidad seleccionada
                }
            }
            
            const profesionalInfo = profesionalSeleccionado ? this.profesionalesHorarios[profesionalSeleccionado] : null;
            
            horaDiv.innerHTML = `
                <div class="hora-info">
                    <div class="flex items-center">
                        <div class="w-6 h-6 rounded-full ${info.estado === 'disponible' ? 'bg-green-100' : 'bg-gray-100'} 
                            flex items-center justify-center mr-2">
                            <i class="fas ${info.estado === 'disponible' ? 'fa-check text-green-600' : 'fa-lock text-gray-400'} text-xs"></i>
                        </div>
                        <span class="hora-badge">${hora}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="hora-estado text-gray-600">
                            ${info.estado === 'ocupado' ? 
                                `Ocupado` : 
                                `${profesionalInfo ? profesionalInfo.especialidad : 'Disponible'}`}
                        </span>
                        ${citaActual ? 
                            `<span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                ${citaActual.nombre}
                            </span>` : 
                            ''}
                    </div>
                </div>
                ${info.estado === 'disponible' ? 
                    `<button class="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 
                        transition-colors flex items-center gap-1">
                        <i class="fas fa-plus text-[10px]"></i>
                        Reservar
                    </button>` : 
                    `<i class="fas fa-chevron-right text-gray-300"></i>`
                }
            `;

            if (info.estado === 'disponible') {
                horaDiv.addEventListener('click', () => this.reservarHora(hora));
            }

            container.appendChild(horaDiv);
        });

        // Actualizar contador de cupos disponibles
        document.getElementById('cuposDisponibles').textContent = horasDisponibles;
    }

    reservarHora(hora) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-medium mb-4">Reservar hora para las ${hora}</h3>
                <form id="formReserva" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input type="text" name="nombre" required class="w-full border rounded p-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                        <input type="text" name="rut" required class="w-full border rounded p-2" 
                            placeholder="12.345.678-9">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Previsión</label>
                        <select name="prevision" required class="w-full border rounded p-2">
                            <option value="FONASA">FONASA</option>
                            <option value="ISAPRE">ISAPRE</option>
                            <option value="PARTICULAR">PARTICULAR</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('button[type="button"]').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Intentar guardar la cita
            if (this.saveCita(hora, formData)) {
                // Actualizar estado del horario
                this.horarios[hora].estado = 'ocupado';
                this.saveHorarios();
                
                // Actualizar vista
                this.renderHorarios();
                
                // Mostrar confirmación
                this.mostrarConfirmacion(hora, formData.get('nombre'));
                
                modal.remove();
            }
        });
    }

    mostrarConfirmacion(hora, nombre) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg transform transition-all duration-300 translate-y-full opacity-0';
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <div>
                    <p class="font-medium">Hora reservada exitosamente</p>
                    <p class="text-sm">${nombre} - ${hora}</p>
                </div>
            </div>
        `;

        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-full', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    initializeEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.initializeCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.initializeCalendar();
        });

        document.getElementById('mostrarTodo').addEventListener('change', (e) => {
            const horasOcupadas = document.querySelectorAll('.hora-ocupada');
            horasOcupadas.forEach(hora => {
                hora.style.display = e.target.checked ? 'flex' : 'none';
            });
        });

        // Agregar listeners para los filtros
        document.getElementById('profesional').addEventListener('change', () => {
            this.renderHorarios();
        });

        document.getElementById('especialidad').addEventListener('change', () => {
            this.renderHorarios();
        });
    }

    renderTablaPacientes() {
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const citasDelDia = citas.filter(c => c.fecha === fecha);

        const tablaPacientes = document.getElementById('tabla-pacientes');
        tablaPacientes.innerHTML = '';

        if (citasDelDia.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-calendar-times text-4xl mb-2"></i>
                    <p>No hay citas agendadas para este día</p>
                </td>
            `;
            tablaPacientes.appendChild(tr);
            return;
        }

        citasDelDia.forEach(cita => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <i class="fas fa-clock text-blue-600"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${cita.hora}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-medium">${cita.rut}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${cita.nombre}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600">${cita.profesional}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600">${cita.consulta}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-600">${cita.duracion} min</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${this.getEstadoClass(cita.estado)}">
                        <i class="fas fa-circle text-[8px] mr-1.5 self-center"></i>
                        ${cita.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${cita.prevision}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center space-x-2">
                        <button class="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" 
                            title="Editar cita" data-action="editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Eliminar cita" data-action="eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;

            // Agregar event listeners a los botones
            const btnEditar = tr.querySelector('[data-action="editar"]');
            const btnEliminar = tr.querySelector('[data-action="eliminar"]');

            btnEditar.addEventListener('click', () => this.editarCita(cita));
            btnEliminar.addEventListener('click', () => this.eliminarCita(cita));

            tablaPacientes.appendChild(tr);
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

    editarCita(cita) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-medium mb-4">Editar cita de las ${cita.hora}</h3>
                <form id="formEditar" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input type="text" name="nombre" required class="w-full border rounded p-2" value="${cita.nombre}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                        <input type="text" name="rut" required class="w-full border rounded p-2" 
                            value="${cita.rut}" placeholder="12.345.678-9">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Previsión</label>
                        <select name="prevision" required class="w-full border rounded p-2">
                            <option value="FONASA" ${cita.prevision === 'FONASA' ? 'selected' : ''}>FONASA</option>
                            <option value="ISAPRE" ${cita.prevision === 'ISAPRE' ? 'selected' : ''}>ISAPRE</option>
                            <option value="PARTICULAR" ${cita.prevision === 'PARTICULAR' ? 'selected' : ''}>PARTICULAR</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select name="estado" required class="w-full border rounded p-2">
                            <option value="En espera" ${cita.estado === 'En espera' ? 'selected' : ''}>En espera</option>
                            <option value="En consulta" ${cita.estado === 'En consulta' ? 'selected' : ''}>En consulta</option>
                            <option value="Atendido" ${cita.estado === 'Atendido' ? 'selected' : ''}>Atendido</option>
                            <option value="Cancelado" ${cita.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('button[type="button"]').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Actualizar la cita
            const citas = JSON.parse(localStorage.getItem('citas') || '[]');
            const index = citas.findIndex(c => c.id === cita.id);
            
            if (index !== -1) {
                citas[index] = {
                    ...cita,
                    nombre: formData.get('nombre'),
                    rut: formData.get('rut'),
                    prevision: formData.get('prevision'),
                    estado: formData.get('estado')
                };
                
                localStorage.setItem('citas', JSON.stringify(citas));
                this.renderTablaPacientes();
                this.renderHorarios();
                
                // Mostrar confirmación
                this.mostrarConfirmacion(cita.hora, 'Cita actualizada correctamente');
            }
            
            modal.remove();
        });
    }

    eliminarCita(cita) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-medium mb-4">Eliminar cita</h3>
                <p class="text-gray-600 mb-6">¿Está seguro que desea eliminar la cita de ${cita.nombre} a las ${cita.hora}?</p>
                <div class="flex justify-end space-x-3">
                    <button type="button" class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                        Cancelar
                    </button>
                    <button type="button" class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
                        Eliminar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const buttons = modal.querySelectorAll('button');
        buttons[0].addEventListener('click', () => modal.remove());
        buttons[1].addEventListener('click', () => {
            // Eliminar la cita
            const citas = JSON.parse(localStorage.getItem('citas') || '[]');
            const index = citas.findIndex(c => c.id === cita.id);
            
            if (index !== -1) {
                citas.splice(index, 1);
                localStorage.setItem('citas', JSON.stringify(citas));
                
                // Actualizar el estado del horario
                if (this.horarios[cita.hora]) {
                    this.horarios[cita.hora].estado = 'disponible';
                    this.saveHorarios();
                }
                
                this.renderTablaPacientes();
                this.renderHorarios();
                
                // Mostrar confirmación
                this.mostrarConfirmacion(cita.hora, 'Cita eliminada correctamente');
            }
            
            modal.remove();
        });
    }

    isHorarioDisponibleParaProfesional(hora, profesional) {
        if (!profesional || !this.profesionalesHorarios[profesional]) return false;

        const horarioProfesional = this.profesionalesHorarios[profesional];
        const diaSeleccionado = this.selectedDate.getDay() || 7; // Convertir 0 (domingo) a 7

        // Verificar si el profesional atiende ese día
        if (!horarioProfesional.dias.includes(diaSeleccionado)) return false;

        // Convertir hora a minutos para comparación
        const [horaActual, minActual] = hora.split(':').map(Number);
        const totalMinutosActual = horaActual * 60 + minActual;

        const [horaInicio, minInicio] = horarioProfesional.inicio.split(':').map(Number);
        const totalMinutosInicio = horaInicio * 60 + minInicio;

        const [horaFin, minFin] = horarioProfesional.fin.split(':').map(Number);
        const totalMinutosFin = horaFin * 60 + minFin;

        return totalMinutosActual >= totalMinutosInicio && totalMinutosActual < totalMinutosFin;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.agendaManager = new AgendaManager();
});

// Funcionalidad para mostrar todo
document.getElementById('mostrarTodo').addEventListener('change', function(e) {
    const horasContainer = document.getElementById('horas-disponibles');
    const horasOcupadas = horasContainer.querySelectorAll('.hora-ocupada');
    
    horasOcupadas.forEach(hora => {
        hora.style.display = e.target.checked ? 'flex' : 'none';
    });
});