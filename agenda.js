class AgendaManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.horarios = this.loadHorarios();
        
        this.initializeCalendar();
        this.updateSelectedDateDisplay();
        this.initializeEventListeners();
        this.renderHorarios();
        this.renderTablaPacientes();
    }

    loadHorarios() {
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const key = `horarios_${fecha}`;
        const savedHorarios = localStorage.getItem(key);
        if (savedHorarios) {
            return JSON.parse(savedHorarios);
        }
        return {
            "09:00": { estado: "disponible", box: "CONSULTA" },
            "09:15": { estado: "disponible", box: "CONSULTA" },
            "09:30": { estado: "disponible", box: "CONSULTA" },
            "09:45": { estado: "disponible", box: "CONSULTA" },
            "10:00": { estado: "disponible", box: "CONSULTA" },
            "10:15": { estado: "disponible", box: "CONSULTA" },
            "10:30": { estado: "disponible", box: "CONSULTA" },
            "10:45": { estado: "disponible", box: "CONSULTA" },
            "11:00": { estado: "disponible", box: "CONSULTA" },
            "11:15": { estado: "disponible", box: "CONSULTA" },
            "11:30": { estado: "disponible", box: "CONSULTA" },
            "11:45": { estado: "disponible", box: "CONSULTA" },
            "12:00": { estado: "disponible", box: "CONSULTA" }
        };
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
            profesional: document.getElementById('profesional').value || 'PINUER GONZALEZ CLAUDIO',
            consulta: document.getElementById('boxAtencion').value || 'CONSULTA',
            duracion: '15',
            origen: 'Web',
            primera: true,
            medioAtencion: document.getElementById('medioAtencion').value,
            sucursal: document.getElementById('sucursal').value
        };

        // Verificar si ya existe una cita en esa fecha y hora
        const citaExistente = citas.find(c => c.fecha === fecha && c.hora === hora);
        if (citaExistente) {
            alert('Ya existe una cita reservada para esta fecha y hora');
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
        
        // Cargar las citas del día seleccionado
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const citasDelDia = citas.filter(c => c.fecha === fecha);

        // Actualizar estado de horarios según citas existentes
        citasDelDia.forEach(cita => {
            if (this.horarios[cita.hora]) {
                this.horarios[cita.hora].estado = 'ocupado';
            }
        });
        
        Object.entries(this.horarios).forEach(([hora, info]) => {
            const horaDiv = document.createElement('div');
            horaDiv.className = `hora-disponible flex items-center justify-between p-3 ${info.estado === 'ocupado' ? 'hora-ocupada' : ''}`;
            
            const citaActual = citasDelDia.find(c => c.hora === hora);
            
            horaDiv.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full ${info.estado === 'disponible' ? 'bg-green-100' : 'bg-gray-100'} 
                        flex items-center justify-center mr-3">
                        <i class="fas fa-clock ${info.estado === 'disponible' ? 'text-green-600' : 'text-gray-400'}"></i>
                    </div>
                    <div>
                        <div class="font-medium">${hora}</div>
                        <div class="text-sm text-gray-500">${info.box}</div>
                        ${citaActual ? `<div class="text-sm text-blue-600">${citaActual.nombre}</div>` : ''}
                    </div>
                </div>
                ${info.estado === 'disponible' ? `
                    <button class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                        Reservar
                    </button>
                ` : `
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-lock mr-1"></i>
                        Ocupado
                    </span>
                `}
            `;

            if (info.estado === 'disponible') {
                horaDiv.addEventListener('click', () => this.reservarHora(hora));
            }

            container.appendChild(horaDiv);
        });

        // Actualizar contador de cupos disponibles
        const cuposDisponibles = Object.values(this.horarios).filter(h => h.estado === 'disponible').length;
        document.getElementById('cuposDisponibles').textContent = cuposDisponibles;
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
    }

    renderTablaPacientes() {
        const fecha = this.selectedDate.toISOString().split('T')[0];
        const citas = JSON.parse(localStorage.getItem('citas') || '[]');
        const citasDelDia = citas.filter(c => c.fecha === fecha);

        const tablaPacientes = document.getElementById('tabla-pacientes');
        tablaPacientes.innerHTML = '';

        citasDelDia.forEach(cita => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.hora}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.rut}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.profesional}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.consulta}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.duracion}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${this.getEstadoClass(cita.estado)}">
                        ${cita.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.origen}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="text-sm">
                        ${cita.primera ? 
                            '<i class="fas fa-check text-green-500"></i>' : 
                            '<i class="fas fa-times text-red-500"></i>'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cita.prevision}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
            `;
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
}

document.addEventListener('DOMContentLoaded', () => {
    new AgendaManager();
});