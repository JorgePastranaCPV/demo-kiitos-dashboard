import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Calendar from '../components/Calendar';

export default function Agenda() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [profesionales, setProfesionales] = useState({});
    const [filtros, setFiltros] = useState({
        profesional: '',
        especialidad: '',
        sucursal: '',
        mostrarTodo: false
    });
    const [horarios, setHorarios] = useState({});
    const [citas, setCitas] = useState([]);

    useEffect(() => {
        // Cargar datos iniciales
        const profesionalesGuardados = JSON.parse(localStorage.getItem('profesionales') || '{}');
        setProfesionales(profesionalesGuardados);

        // Cargar citas del día seleccionado
        cargarCitasDelDia();
    }, [selectedDate]);

    const cargarCitasDelDia = () => {
        // Simulación de carga de citas
        const citasSimuladas = [
            {
                id: 1,
                hora: '09:00',
                paciente: 'Juan Pérez',
                profesional: 'Dr. García',
                consulta: 'Medicina General',
                estado: 'En espera'
            },
            // Más citas simuladas aquí
        ];
        setCitas(citasSimuladas);
    };

    const getDiasTexto = (dias) => {
        const nombresDias = {
            1: 'Lun',
            2: 'Mar',
            3: 'Mié',
            4: 'Jue',
            5: 'Vie'
        };
        return dias.map(d => nombresDias[d]).join(', ');
    };

    const getEstadoClass = (estado) => {
        const clases = {
            'En espera': 'bg-yellow-100 text-yellow-800',
            'En consulta': 'bg-blue-100 text-blue-800',
            'Atendido': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800'
        };
        return clases[estado] || 'bg-gray-100 text-gray-800';
    };

    const isHorarioDisponibleParaProfesional = (hora, profesional) => {
        if (!profesional || !profesionales[profesional]) return false;

        const horarioProfesional = profesionales[profesional];
        const diaSeleccionado = selectedDate.getDay() || 7;

        if (!horarioProfesional.dias.includes(diaSeleccionado)) return false;

        const [horaActual, minActual] = hora.split(':').map(Number);
        const totalMinutosActual = horaActual * 60 + minActual;

        const [horaInicio, minInicio] = horarioProfesional.inicio.split(':').map(Number);
        const totalMinutosInicio = horaInicio * 60 + minInicio;

        const [horaFin, minFin] = horarioProfesional.fin.split(':').map(Number);
        const totalMinutosFin = horaFin * 60 + minFin;

        return totalMinutosActual >= totalMinutosInicio && totalMinutosActual < totalMinutosFin;
    };

    const mostrarConfirmacion = (hora, nombre) => {
        // Implementar notificación toast usando un estado y un efecto temporal
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
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    return (
        <main className="mt-24 max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
                {/* Calendario */}
                <div className="col-span-3 glass-effect rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(currentDate.getMonth() - 1);
                                setCurrentDate(newDate);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <FontAwesomeIcon icon="chevron-left" />
                        </button>
                        <h2 className="text-lg font-medium text-gray-900">
                            {currentDate.toLocaleString('es', { month: 'long' }).toUpperCase()} {currentDate.getFullYear()}
                        </h2>
                        <button
                            onClick={() => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(currentDate.getMonth() + 1);
                                setCurrentDate(newDate);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <FontAwesomeIcon icon="chevron-right" />
                        </button>
                    </div>
                    <Calendar
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                    />
                </div>

                {/* Horarios y Filtros */}
                <div className="col-span-9 space-y-6">
                    <div className="glass-effect rounded-xl p-4">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                            DÍA {selectedDate.toLocaleString('es', { weekday: 'long' }).toUpperCase()} {
                                selectedDate.getDate().toString().padStart(2, '0')
                            }
                        </h3>

                        {/* Filtros */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <select
                                className="form-select rounded-lg"
                                value={filtros.profesional}
                                onChange={(e) => setFiltros({ ...filtros, profesional: e.target.value })}
                            >
                                <option value="">-- Seleccionar Profesional --</option>
                                {Object.entries(profesionales).map(([nombre, datos]) => (
                                    <option key={nombre} value={nombre}>{nombre}</option>
                                ))}
                            </select>

                            <select
                                className="form-select rounded-lg"
                                value={filtros.especialidad}
                                onChange={(e) => setFiltros({ ...filtros, especialidad: e.target.value })}
                            >
                                <option value="">-- Seleccionar Especialidad --</option>
                                {[...new Set(Object.values(profesionales).map(p => p.especialidad))].map(esp => (
                                    <option key={esp} value={esp}>{esp}</option>
                                ))}
                            </select>

                            <select
                                className="form-select rounded-lg"
                                value={filtros.sucursal}
                                onChange={(e) => setFiltros({ ...filtros, sucursal: e.target.value })}
                            >
                                <option value="">-- Seleccionar Sucursal --</option>
                                {[...new Set(Object.values(profesionales).map(p => p.sucursal))].map(suc => (
                                    <option key={suc} value={suc}>{suc}</option>
                                ))}
                            </select>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="mostrarTodo"
                                    checked={filtros.mostrarTodo}
                                    onChange={(e) => setFiltros({ ...filtros, mostrarTodo: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <label htmlFor="mostrarTodo" className="ml-2 text-sm text-gray-700">
                                    Mostrar horas ocupadas
                                </label>
                            </div>
                        </div>

                        {/* Lista de Horarios */}
                        <div className="grid grid-cols-4 gap-4" id="horas-disponibles">
                            {Object.entries(horarios).map(([hora, info]) => {
                                // Verificar disponibilidad según filtros
                                if (filtros.profesional && !isHorarioDisponibleParaProfesional(hora, filtros.profesional)) {
                                    return null;
                                }

                                if (info.estado === 'ocupado' && !filtros.mostrarTodo) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={hora}
                                        className={`p-4 rounded-lg transition-all ${info.estado === 'ocupado'
                                            ? 'bg-gray-100 cursor-not-allowed'
                                            : 'bg-white hover:shadow-md cursor-pointer'
                                            }`}
                                        onClick={() => {
                                            if (info.estado !== 'ocupado') {
                                                // Aquí iría la lógica para reservar la hora
                                                mostrarConfirmacion(hora, 'Nombre del Paciente');
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-medium text-gray-900">{hora}</span>
                                            <FontAwesomeIcon
                                                icon={info.estado === 'ocupado' ? 'calendar-times' : 'calendar-plus'}
                                                className={info.estado === 'ocupado' ? 'text-red-500' : 'text-green-500'}
                                            />
                                        </div>
                                        {info.estado === 'ocupado' && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {info.paciente} - {info.profesional}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabla de Pacientes */}
                    <div className="glass-effect rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hora
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paciente
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Profesional
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Consulta
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 divide-y divide-gray-200">
                                {citas.map((cita) => (
                                    <tr key={cita.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {cita.hora}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{cita.paciente}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cita.profesional}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cita.consulta}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(cita.estado)}`}>
                                                {cita.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                                                <FontAwesomeIcon icon="edit" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <FontAwesomeIcon icon="trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
} 