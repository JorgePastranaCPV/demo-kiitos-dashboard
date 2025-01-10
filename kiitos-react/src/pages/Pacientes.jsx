import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Pacientes() {
    const [pacientes, setPacientes] = useState([]);
    const [filtros, setFiltros] = useState({
        nombre: '',
        rut: '',
        profesional: '',
        estado: ''
    });

    useEffect(() => {
        cargarPacientes();
    }, []);

    const cargarPacientes = () => {
        try {
            const citasGuardadas = localStorage.getItem('citas');
            console.log('Datos crudos del localStorage:', citasGuardadas);

            if (!citasGuardadas) {
                console.log('No hay citas guardadas en localStorage');
                return;
            }

            const todasLasCitas = JSON.parse(citasGuardadas);
            console.log('Citas parseadas:', todasLasCitas);

            // Ordenar las citas por fecha y hora
            const citasOrdenadas = todasLasCitas.sort((a, b) => {
                const fechaA = new Date(a.fecha + 'T' + a.hora);
                const fechaB = new Date(b.fecha + 'T' + b.hora);
                return fechaB - fechaA; // Orden descendente (más recientes primero)
            });

            console.log('Citas ordenadas:', citasOrdenadas);
            setPacientes(citasOrdenadas);

        } catch (error) {
            console.error('Error al cargar las citas:', error);
        }
    };

    const filtrarPacientes = () => {
        console.log('Aplicando filtros:', filtros);
        console.log('Total de pacientes antes de filtrar:', pacientes.length);

        const filtrados = pacientes.filter(paciente => {
            const cumpleFiltros = (
                paciente.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
                paciente.rut.includes(filtros.rut) &&
                (filtros.profesional === '' || paciente.profesional === filtros.profesional) &&
                (filtros.estado === '' || paciente.estado === filtros.estado)
            );
            return cumpleFiltros;
        });

        console.log('Pacientes filtrados:', filtrados.length);
        return filtrados;
    };

    const actualizarEstado = (id, nuevoEstado) => {
        const todasLasCitas = JSON.parse(localStorage.getItem('citas') || '[]');
        const citaIndex = todasLasCitas.findIndex(cita => cita.id === id);

        if (citaIndex !== -1) {
            todasLasCitas[citaIndex].estado = nuevoEstado;
            localStorage.setItem('citas', JSON.stringify(todasLasCitas));
            setPacientes(todasLasCitas);
        }
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

    const profesionalesUnicos = [...new Set(pacientes.map(p => p.profesional))];
    const pacientesFiltrados = filtrarPacientes();

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">PACIENTES</h2>
                    <button
                        onClick={cargarPacientes}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon="sync" />
                        Recargar datos
                    </button>
                </div>

                {/* Debug info */}
                <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
                    <p>Total de pacientes: {pacientes.length}</p>
                    <p>Pacientes filtrados: {filtrarPacientes().length}</p>
                    <p>Filtros activos: {Object.entries(filtros).filter(([_, v]) => v !== '').length}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-2"
                            value={filtros.nombre}
                            onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                            placeholder="Buscar por nombre"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            RUT
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-2"
                            value={filtros.rut}
                            onChange={(e) => setFiltros({ ...filtros, rut: e.target.value })}
                            placeholder="Buscar por RUT"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Profesional
                        </label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={filtros.profesional}
                            onChange={(e) => setFiltros({ ...filtros, profesional: e.target.value })}
                        >
                            <option value="">Todos</option>
                            {profesionalesUnicos.map(prof => (
                                <option key={prof} value={prof}>{prof}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Estado
                        </label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={filtros.estado}
                            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                        >
                            <option value="">Todos</option>
                            <option value="En espera">En espera</option>
                            <option value="En consulta">En consulta</option>
                            <option value="Atendido">Atendido</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de Pacientes */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesional</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consulta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pacientesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No se encontraron pacientes
                                    </td>
                                </tr>
                            ) : (
                                pacientesFiltrados.map((paciente) => (
                                    <tr key={paciente.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(paciente.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paciente.hora}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paciente.rut}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paciente.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.profesional}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.consulta}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(paciente.estado)}`}>
                                                {paciente.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => actualizarEstado(paciente.id, 'En consulta')}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Marcar en consulta"
                                                >
                                                    <FontAwesomeIcon icon="user-md" />
                                                </button>
                                                <button
                                                    onClick={() => actualizarEstado(paciente.id, 'Atendido')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Marcar como atendido"
                                                >
                                                    <FontAwesomeIcon icon="check" />
                                                </button>
                                                <button
                                                    onClick={() => actualizarEstado(paciente.id, 'Cancelado')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Cancelar cita"
                                                >
                                                    <FontAwesomeIcon icon="times" />
                                                </button>
                                            </div>
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

export default Pacientes; 