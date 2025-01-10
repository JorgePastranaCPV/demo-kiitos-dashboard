import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Calendar from '../components/Calendar';

function Agenda() {
    const [currentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);
    const [pacienteData, setPacienteData] = useState({
        nombre: '',
        rut: '',
        prevision: 'FONASA'
    });

    const [filtros, setFiltros] = useState({
        medioAtencion: '',
        profesional: '',
        especialidad: '',
        sucursal: '',
        mostrarTodo: false
    });

    const [citas, setCitas] = useState([]);

    // Horarios fijos
    const horariosFijos = {
        '08:00': { estado: 'disponible' },
        '08:30': { estado: 'disponible' },
        '09:00': { estado: 'disponible' },
        '09:30': { estado: 'disponible' },
        '10:00': { estado: 'disponible' },
        '10:30': { estado: 'disponible' },
        '11:00': { estado: 'disponible' },
        '11:30': { estado: 'disponible' },
        '12:00': { estado: 'disponible' },
        '12:30': { estado: 'disponible' },
        '13:00': { estado: 'disponible' },
        '13:30': { estado: 'disponible' },
        '14:00': { estado: 'disponible' }
    };

    // Profesionales fijos
    const profesionalesFijos = {
        'Dr. Juan Pérez': {
            dias: [1, 2, 3, 4, 5], // Lunes a Viernes
            especialidad: 'Medicina General',
            sucursal: 'Clínica San Carlos'
        },
        'Dra. María González': {
            dias: [1, 3, 5], // Lunes, Miércoles, Viernes
            especialidad: 'Pediatría',
            sucursal: 'Centro Médico Las Condes'
        },
        'Dr. Carlos Rodríguez': {
            dias: [2, 4], // Martes, Jueves
            especialidad: 'Cardiología',
            sucursal: 'Hospital del Valle'
        }
    };

    const [horarios, setHorarios] = useState(horariosFijos);
    const [profesionales] = useState(profesionalesFijos);

    useEffect(() => {
        if (filtros.profesional) {
            const profesional = profesionales[filtros.profesional];
            const diaSeleccionado = selectedDate.getDay();
            const diaAjustado = diaSeleccionado === 0 ? 7 : diaSeleccionado;

            // Si el profesional atiende este día, mostrar horarios
            if (profesional.dias.includes(diaAjustado)) {
                setHorarios(horariosFijos);
            } else {
                setHorarios({});
            }

            // Cargar citas existentes
            const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
            const citasDelDia = todasLasCitas.filter(c =>
                c.fecha === selectedDate.toISOString().split('T')[0] &&
                c.profesional === filtros.profesional
            );
            setCitas(citasDelDia);
        } else {
            setHorarios({});
            setCitas([]);
        }
    }, [selectedDate, filtros.profesional]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const isHorarioDisponible = (hora) => {
        if (!filtros.profesional || !profesionales[filtros.profesional]) return false;

        const profesional = profesionales[filtros.profesional];
        const diaSeleccionado = selectedDate.getDay();
        const diaAjustado = diaSeleccionado === 0 ? 7 : diaSeleccionado;

        return profesional.dias.includes(diaAjustado);
    };

    const handleReservarHora = (hora) => {
        if (!filtros.profesional || !filtros.especialidad || !filtros.sucursal) {
            alert('Por favor seleccione todos los campos requeridos');
            return;
        }
        setHoraSeleccionada(hora);
        setShowModal(true);
    };

    const handleSubmitReserva = (e) => {
        e.preventDefault();

        const nuevaCita = {
            id: Date.now(),
            fecha: selectedDate.toISOString().split('T')[0],
            hora: horaSeleccionada,
            nombre: pacienteData.nombre,
            rut: pacienteData.rut,
            prevision: pacienteData.prevision,
            estado: 'En espera',
            profesional: filtros.profesional,
            consulta: filtros.especialidad,
            duracion: '30',
            medioAtencion: filtros.medioAtencion,
            sucursal: filtros.sucursal
        };

        const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
        todasLasCitas.push(nuevaCita);
        localStorage.setItem('citas', JSON.stringify(todasLasCitas));

        // Recargar citas
        const citasDelDia = todasLasCitas.filter(c =>
            c.fecha === nuevaCita.fecha &&
            c.profesional === filtros.profesional
        );
        setCitas(citasDelDia);

        // Limpiar y cerrar modal
        setPacienteData({
            nombre: '',
            rut: '',
            prevision: 'FONASA'
        });
        setShowModal(false);
        setHoraSeleccionada(null);
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

    const HORARIOS_DISPONIBLES = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'
    ];

    const renderHorarios = () => {
        if (!filtros.profesional) {
            return (
                <p className="col-span-full text-center text-gray-500">
                    Seleccione un profesional para ver los horarios disponibles
                </p>
            );
        }

        const profesional = profesionales[filtros.profesional];
        const diaSeleccionado = selectedDate.getDay();
        const diaAjustado = diaSeleccionado === 0 ? 7 : diaSeleccionado;
        const disponible = profesional.dias.includes(diaAjustado);

        if (!disponible) {
            return (
                <p className="col-span-full text-center text-gray-500">
                    El profesional no atiende este día
                </p>
            );
        }

        return HORARIOS_DISPONIBLES.map(hora => {
            const citaActual = citas.find(c => c.hora === hora);
            const estado = citaActual ? 'ocupado' : 'disponible';

            if (estado === 'ocupado' && !filtros.mostrarTodo) return null;

            return (
                <button
                    key={hora}
                    onClick={() => estado === 'disponible' && handleReservarHora(hora)}
                    className={`p-4 rounded-xl ${estado === 'ocupado'
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300'
                        } transition-all duration-300`}
                    disabled={estado === 'ocupado'}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-900">{hora}</span>
                        <FontAwesomeIcon
                            icon={estado === 'ocupado' ? 'calendar-times' : 'calendar-plus'}
                            className={estado === 'ocupado' ? 'text-red-500' : 'text-green-500'}
                        />
                    </div>
                    {citaActual && (
                        <p className="text-sm text-gray-500 mt-1">
                            {citaActual.nombre}
                        </p>
                    )}
                </button>
            );
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800">RESERVAR UNA HORA</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Medio atención
                        </label>
                        <select
                            className="w-full border rounded-lg p-2 bg-white"
                            value={filtros.medioAtencion}
                            onChange={(e) => setFiltros({ ...filtros, medioAtencion: e.target.value })}
                        >
                            <option value="">Seleccionar</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Telemedicina">Telemedicina</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Sucursal
                        </label>
                        <select
                            className="w-full border rounded-lg p-2 bg-white"
                            value={filtros.sucursal}
                            onChange={(e) => setFiltros({ ...filtros, sucursal: e.target.value })}
                        >
                            <option value="">Seleccionar</option>
                            {[...new Set(Object.values(profesionales).map(p => p.sucursal))].map(suc => (
                                <option key={suc} value={suc}>{suc}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Especialidad
                        </label>
                        <select
                            className="w-full border rounded-lg p-2 bg-white"
                            value={filtros.especialidad}
                            onChange={(e) => setFiltros({ ...filtros, especialidad: e.target.value })}
                        >
                            <option value="">Seleccionar</option>
                            {[...new Set(Object.values(profesionales).map(p => p.especialidad))].map(esp => (
                                <option key={esp} value={esp}>{esp}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Profesional
                        </label>
                        <select
                            className="w-full border rounded-lg p-2 bg-white"
                            value={filtros.profesional}
                            onChange={(e) => setFiltros({ ...filtros, profesional: e.target.value })}
                        >
                            <option value="">Seleccionar</option>
                            {Object.entries(profesionales)
                                .filter(([_, datos]) =>
                                    (!filtros.especialidad || datos.especialidad === filtros.especialidad) &&
                                    (!filtros.sucursal || datos.sucursal === filtros.sucursal)
                                )
                                .map(([nombre]) => (
                                    <option key={nombre} value={nombre}>{nombre}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <Calendar
                            currentDate={currentDate}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                        />
                    </div>
                </div>

                <div className="w-full md:w-2/3">
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800">
                                        DÍA {selectedDate.toLocaleString('es', { weekday: 'long' }).toUpperCase()} {selectedDate.getDate()}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Horas disponibles: {Object.entries(horarios).filter(([hora, info]) =>
                                            info.estado === 'disponible' && isHorarioDisponible(hora)
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {!filtros.profesional ? (
                                <p className="text-gray-600">
                                    Seleccione un profesional para ver las horas disponibles.
                                </p>
                            ) : !isHorarioDisponible('00:00') ? (
                                <p className="text-gray-600">
                                    El profesional no atiende este día.
                                </p>
                            ) : (
                                <>
                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="mostrarTodo"
                                            checked={filtros.mostrarTodo}
                                            onChange={(e) => setFiltros({ ...filtros, mostrarTodo: e.target.checked })}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="mostrarTodo" className="ml-2 text-sm text-gray-600">
                                            Mostrar horas ocupadas
                                        </label>
                                    </div>

                                    {console.log('Estado antes de renderizar:', {
                                        horarios,
                                        totalHorarios: Object.keys(horarios).length,
                                        horariosDisponibles: Object.entries(horarios).filter(([hora]) => isHorarioDisponible(hora)).length
                                    })}

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {renderHorarios()}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Citas */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-medium text-gray-800">
                        Citas del día
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesional</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consulta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previsión</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {citas.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No hay citas agendadas para este día
                                    </td>
                                </tr>
                            ) : (
                                citas.map((cita) => (
                                    <tr key={cita.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.hora}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.rut}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.profesional}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.consulta}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(cita.estado)}`}>
                                                {cita.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.prevision}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Reserva */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Reservar Hora Médica</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FontAwesomeIcon icon="times" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReserva} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Paciente
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={pacienteData.nombre}
                                    onChange={(e) => setPacienteData({ ...pacienteData, nombre: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Nombre completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    RUT
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={pacienteData.rut}
                                    onChange={(e) => setPacienteData({ ...pacienteData, rut: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="12.345.678-9"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Previsión
                                </label>
                                <select
                                    required
                                    value={pacienteData.prevision}
                                    onChange={(e) => setPacienteData({ ...pacienteData, prevision: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="FONASA">FONASA</option>
                                    <option value="ISAPRE">ISAPRE</option>
                                    <option value="PARTICULAR">PARTICULAR</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Agenda; 