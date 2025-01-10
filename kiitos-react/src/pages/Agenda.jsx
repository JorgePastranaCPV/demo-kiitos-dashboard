import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Calendar from '../components/Calendar';

function Agenda() {
    const [currentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [horarios, setHorarios] = useState({});
    const [filtros, setFiltros] = useState({
        medioAtencion: '',
        profesional: '',
        especialidad: '',
        sucursal: '',
        mostrarTodo: false
    });
    const [profesionales, setProfesionales] = useState({});
    const [citas, setCitas] = useState([]);

    useEffect(() => {
        // Cargar profesionales guardados o usar datos predeterminados
        const savedProfesionales = localStorage.getItem('profesionales');
        if (savedProfesionales) {
            setProfesionales(JSON.parse(savedProfesionales));
        } else {
            const defaultProfesionales = {
                'Dr. Juan Pérez': {
                    inicio: '08:00',
                    fin: '14:00',
                    dias: [1, 2, 3, 4, 5],
                    especialidad: 'Medicina General',
                    sucursal: 'Clínica San Carlos'
                },
                'Dra. María González': {
                    inicio: '14:00',
                    fin: '19:00',
                    dias: [1, 3, 5],
                    especialidad: 'Pediatría',
                    sucursal: 'Centro Médico Las Condes'
                },
                'Dr. Carlos Rodríguez': {
                    inicio: '08:00',
                    fin: '13:00',
                    dias: [2, 4],
                    especialidad: 'Cardiología',
                    sucursal: 'Hospital del Valle'
                }
            };
            setProfesionales(defaultProfesionales);
            localStorage.setItem('profesionales', JSON.stringify(defaultProfesionales));
        }
    }, []);

    useEffect(() => {
        cargarHorarios();
        cargarCitas();
    }, [selectedDate, filtros.profesional]);

    const cargarHorarios = () => {
        if (!filtros.profesional) return;

        const fecha = selectedDate.toISOString().split('T')[0];
        const key = `horarios_${fecha}_${filtros.profesional}`;
        const savedHorarios = localStorage.getItem(key);

        if (savedHorarios) {
            setHorarios(JSON.parse(savedHorarios));
        } else {
            const nuevosHorarios = {};
            const profesional = profesionales[filtros.profesional];
            if (profesional) {
                const [horaInicio] = profesional.inicio.split(':').map(Number);
                const [horaFin] = profesional.fin.split(':').map(Number);

                for (let hora = horaInicio; hora < horaFin; hora++) {
                    for (let minuto = 0; minuto < 60; minuto += 15) {
                        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
                        nuevosHorarios[horaStr] = { estado: "disponible" };
                    }
                }
            }
            setHorarios(nuevosHorarios);
            localStorage.setItem(key, JSON.stringify(nuevosHorarios));
        }
    };

    const cargarCitas = () => {
        const fecha = selectedDate.toISOString().split('T')[0];
        const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
        const citasDelDia = todasLasCitas.filter(c =>
            c.fecha === fecha &&
            (!filtros.profesional || c.profesional === filtros.profesional)
        );
        setCitas(citasDelDia);

        // Actualizar estado de horarios
        const nuevosHorarios = { ...horarios };
        citasDelDia.forEach(cita => {
            if (nuevosHorarios[cita.hora]) {
                nuevosHorarios[cita.hora].estado = 'ocupado';
            }
        });
        setHorarios(nuevosHorarios);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const isHorarioDisponible = (hora) => {
        if (!filtros.profesional || !profesionales[filtros.profesional]) return false;

        const profesional = profesionales[filtros.profesional];
        const diaSeleccionado = selectedDate.getDay() || 7; // Convertir 0 (domingo) a 7

        return profesional.dias.includes(diaSeleccionado);
    };

    const reservarHora = (hora) => {
        if (!filtros.profesional || !filtros.especialidad || !filtros.sucursal) {
            alert('Por favor seleccione todos los campos requeridos');
            return;
        }

        const nombre = prompt('Nombre del paciente:');
        if (!nombre) return;

        const rut = prompt('RUT del paciente:');
        if (!rut) return;

        const prevision = prompt('Previsión (FONASA/ISAPRE/PARTICULAR):');
        if (!prevision) return;

        const nuevaCita = {
            id: Date.now(),
            fecha: selectedDate.toISOString().split('T')[0],
            hora,
            nombre,
            rut,
            prevision,
            estado: 'En espera',
            profesional: filtros.profesional,
            consulta: filtros.especialidad,
            duracion: '15',
            medioAtencion: filtros.medioAtencion,
            sucursal: filtros.sucursal
        };

        const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
        todasLasCitas.push(nuevaCita);
        localStorage.setItem('citas', JSON.stringify(todasLasCitas));

        // Actualizar horarios
        const nuevosHorarios = { ...horarios };
        nuevosHorarios[hora].estado = 'ocupado';
        setHorarios(nuevosHorarios);

        const key = `horarios_${nuevaCita.fecha}_${filtros.profesional}`;
        localStorage.setItem(key, JSON.stringify(nuevosHorarios));

        cargarCitas();
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
                                        Horas disponibles: {Object.values(horarios).filter(h => h.estado === 'disponible').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {!filtros.profesional ? (
                                <p className="text-gray-600">
                                    Seleccione un profesional para ver las horas disponibles.
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

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Object.entries(horarios).map(([hora, info]) => {
                                            if (!isHorarioDisponible(hora)) return null;
                                            if (info.estado === 'ocupado' && !filtros.mostrarTodo) return null;

                                            const citaActual = citas.find(c => c.hora === hora);

                                            return (
                                                <button
                                                    key={hora}
                                                    onClick={() => info.estado === 'disponible' && reservarHora(hora)}
                                                    className={`p-4 rounded-xl ${info.estado === 'ocupado'
                                                        ? 'bg-gray-100 cursor-not-allowed'
                                                        : 'bg-white shadow-sm hover:shadow-md'
                                                        } transition-all duration-300`}
                                                    disabled={info.estado === 'ocupado'}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-medium text-gray-900">{hora}</span>
                                                        <FontAwesomeIcon
                                                            icon={info.estado === 'ocupado' ? 'calendar-times' : 'calendar-plus'}
                                                            className={info.estado === 'ocupado' ? 'text-red-500' : 'text-green-500'}
                                                        />
                                                    </div>
                                                    {citaActual && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {citaActual.nombre}
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
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
        </div>
    );
}

export default Agenda; 