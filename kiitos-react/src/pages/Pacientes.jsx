import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Pacientes() {
    return (
        <main className="mt-24 max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-light text-gray-800">Lista de Pacientes</h2>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center">
                    <FontAwesomeIcon icon="plus" className="mr-2" />
                    Nuevo Paciente
                </button>
            </div>

            {/* Tabla de Pacientes */}
            <div className="glass-effect rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Edad
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Última Visita
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
                        {[1, 2, 3].map((_, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FontAwesomeIcon icon="user" className="text-gray-500" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                Juan Pérez
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                juan@example.com
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">35 años</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">15 Enero 2024</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Activo
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
        </main>
    );
} 