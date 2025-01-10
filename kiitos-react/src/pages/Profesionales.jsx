import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Profesionales() {
    const [profesionales, setProfesionales] = useState({});
    const [editando, setEditando] = useState(null);
    const [nuevoHorario, setNuevoHorario] = useState({
        nombre: '',
        inicio: '08:00',
        fin: '18:00',
        dias: [],
        especialidad: '',
        sucursal: '',
        googleCalendarId: ''
    });

    useEffect(() => {
        const savedProfesionales = localStorage.getItem('profesionales');
        if (savedProfesionales) {
            setProfesionales(JSON.parse(savedProfesionales));
        }
    }, []);

    const guardarProfesional = () => {
        if (!nuevoHorario.nombre || !nuevoHorario.especialidad || !nuevoHorario.sucursal) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const nuevosProfesionales = {
            ...profesionales,
            [nuevoHorario.nombre]: {
                inicio: nuevoHorario.inicio,
                fin: nuevoHorario.fin,
                dias: nuevoHorario.dias,
                especialidad: nuevoHorario.especialidad,
                sucursal: nuevoHorario.sucursal,
                googleCalendarId: nuevoHorario.googleCalendarId
            }
        };

        setProfesionales(nuevosProfesionales);
        localStorage.setItem('profesionales', JSON.stringify(nuevosProfesionales));

        setNuevoHorario({
            nombre: '',
            inicio: '08:00',
            fin: '18:00',
            dias: [],
            especialidad: '',
            sucursal: '',
            googleCalendarId: ''
        });
        setEditando(null);
    };

    const eliminarProfesional = (nombre) => {
        if (window.confirm(`¿Está seguro de eliminar al profesional ${nombre}?`)) {
            const { [nombre]: eliminado, ...resto } = profesionales;
            setProfesionales(resto);
            localStorage.setItem('profesionales', JSON.stringify(resto));
        }
    };

    const editarProfesional = (nombre) => {
        setEditando(nombre);
        setNuevoHorario({
            nombre,
            ...profesionales[nombre]
        });
    };

    const diasSemana = [
        { id: 1, nombre: 'Lunes' },
        { id: 2, nombre: 'Martes' },
        { id: 3, nombre: 'Miércoles' },
        { id: 4, nombre: 'Jueves' },
        { id: 5, nombre: 'Viernes' },
        { id: 6, nombre: 'Sábado' },
        { id: 7, nombre: 'Domingo' }
    ];

    const toggleDia = (diaId) => {
        const dias = nuevoHorario.dias.includes(diaId)
            ? nuevoHorario.dias.filter(d => d !== diaId)
            : [...nuevoHorario.dias, diaId];
        setNuevoHorario({ ...nuevoHorario, dias });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800">
                    {editando ? 'EDITAR PROFESIONAL' : 'AGREGAR NUEVO PROFESIONAL'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={nuevoHorario.nombre}
                                onChange={(e) => setNuevoHorario({ ...nuevoHorario, nombre: e.target.value })}
                                placeholder="Dr. Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Especialidad
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={nuevoHorario.especialidad}
                                onChange={(e) => setNuevoHorario({ ...nuevoHorario, especialidad: e.target.value })}
                                placeholder="Medicina General"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Sucursal
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={nuevoHorario.sucursal}
                                onChange={(e) => setNuevoHorario({ ...nuevoHorario, sucursal: e.target.value })}
                                placeholder="Clínica Central"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                ID de Google Calendar
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                value={nuevoHorario.googleCalendarId}
                                onChange={(e) => setNuevoHorario({ ...nuevoHorario, googleCalendarId: e.target.value })}
                                placeholder="ejemplo@group.calendar.google.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Hora inicio
                                </label>
                                <input
                                    type="time"
                                    className="w-full border rounded-lg p-2"
                                    value={nuevoHorario.inicio}
                                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, inicio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Hora fin
                                </label>
                                <input
                                    type="time"
                                    className="w-full border rounded-lg p-2"
                                    value={nuevoHorario.fin}
                                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, fin: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Días de atención
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {diasSemana.map(dia => (
                                    <label
                                        key={dia.id}
                                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${nuevoHorario.dias.includes(dia.id)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={nuevoHorario.dias.includes(dia.id)}
                                            onChange={() => toggleDia(dia.id)}
                                        />
                                        <span className="ml-2">{dia.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    {editando && (
                        <button
                            onClick={() => {
                                setEditando(null);
                                setNuevoHorario({
                                    nombre: '',
                                    inicio: '08:00',
                                    fin: '18:00',
                                    dias: [],
                                    especialidad: '',
                                    sucursal: '',
                                    googleCalendarId: ''
                                });
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={guardarProfesional}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-medium text-gray-800">
                        Profesionales registrados
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(profesionales).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No hay profesionales registrados
                                    </td>
                                </tr>
                            ) : (
                                Object.entries(profesionales).map(([nombre, datos]) => (
                                    <tr key={nombre} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{datos.especialidad}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{datos.sucursal}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {datos.inicio} - {datos.fin}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {datos.dias.map(d => diasSemana.find(dia => dia.id === d)?.nombre[0]).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            <button
                                                onClick={() => editarProfesional(nombre)}
                                                className="text-blue-600 hover:text-blue-800 mx-2"
                                            >
                                                <FontAwesomeIcon icon="edit" />
                                            </button>
                                            <button
                                                onClick={() => eliminarProfesional(nombre)}
                                                className="text-red-600 hover:text-red-800 mx-2"
                                            >
                                                <FontAwesomeIcon icon="trash-alt" />
                                            </button>
                                        </td>
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

export default Profesionales; 