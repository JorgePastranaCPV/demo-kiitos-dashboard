import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Base de datos simulada de medicamentos por categoría
const medicamentosPorCategoria = {
    'Analgésicos': [
        { id: 'med1', nombre: 'Paracetamol', descripcion: 'Analgésico y antipirético', presentacion: 'Tabletas 500mg' },
        { id: 'med2', nombre: 'Ibuprofeno', descripcion: 'Antiinflamatorio no esteroideo', presentacion: 'Tabletas 400mg' }
    ],
    'Antibióticos': [
        { id: 'med3', nombre: 'Amoxicilina', descripcion: 'Antibiótico de amplio espectro', presentacion: 'Cápsulas 500mg' },
        { id: 'med4', nombre: 'Azitromicina', descripcion: 'Antibiótico macrólido', presentacion: 'Tabletas 500mg' }
    ]
};

// Base de datos simulada de exámenes por categoría
const examenesPorCategoria = {
    'Laboratorio': [
        { id: 'lab1', nombre: 'Hemograma completo', descripcion: 'Análisis completo de células sanguíneas' },
        { id: 'lab2', nombre: 'Perfil bioquímico', descripcion: 'Evaluación de función hepática y renal' }
    ],
    'Imagenología': [
        { id: 'img1', nombre: 'Radiografía de tórax', descripcion: 'Imagen de los pulmones y el corazón' },
        { id: 'img2', nombre: 'Ecografía abdominal', descripcion: 'Evaluación de órganos abdominales' }
    ]
};

export default function RegistroClinico() {
    const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState(new Set());
    const [examenesSeleccionados, setExamenesSeleccionados] = useState(new Set());
    const [categoriaMedicamentoActual, setCategoriaMedicamentoActual] = useState('Analgésicos');
    const [categoriaExamenActual, setCategoriaExamenActual] = useState('Laboratorio');
    const [busquedaMedicamento, setBusquedaMedicamento] = useState('');
    const [busquedaExamen, setBusquedaExamen] = useState('');
    const [modalRecetasAbierto, setModalRecetasAbierto] = useState(false);
    const [modalExamenesAbierto, setModalExamenesAbierto] = useState(false);

    const getIconoCategoriaMedicamento = (categoria) => {
        const iconos = {
            'Analgésicos': 'pills',
            'Antibióticos': 'capsules',
            'Antiinflamatorios': 'tablets',
            'Antialérgicos': 'prescription-bottle-alt'
        };
        return iconos[categoria] || 'prescription-bottle';
    };

    const getIconoCategoriaExamen = (categoria) => {
        const iconos = {
            'Laboratorio': 'flask',
            'Imagenología': 'x-ray',
            'Cardiología': 'heartbeat',
            'Neurología': 'brain'
        };
        return iconos[categoria] || 'microscope';
    };

    const toggleMedicamento = (id, nombre, descripcion, presentacion, categoria) => {
        const nuevosMedicamentos = new Set(medicamentosSeleccionados);
        if (nuevosMedicamentos.has(id)) {
            nuevosMedicamentos.delete(id);
        } else {
            nuevosMedicamentos.add(id);
        }
        setMedicamentosSeleccionados(nuevosMedicamentos);
    };

    const toggleExamen = (id, nombre, descripcion, categoria) => {
        const nuevosExamenes = new Set(examenesSeleccionados);
        if (nuevosExamenes.has(id)) {
            nuevosExamenes.delete(id);
        } else {
            nuevosExamenes.add(id);
        }
        setExamenesSeleccionados(nuevosExamenes);
    };

    const buscarMedicamentos = (query) => {
        if (!query.trim()) {
            return Object.entries(medicamentosPorCategoria)
                .filter(([categoria]) => categoria === categoriaMedicamentoActual)
                .flatMap(([categoria, medicamentos]) =>
                    medicamentos.map(med => ({ ...med, categoria }))
                );
        }

        query = query.toLowerCase();
        return Object.entries(medicamentosPorCategoria)
            .flatMap(([categoria, medicamentos]) =>
                medicamentos
                    .filter(med =>
                        med.nombre.toLowerCase().includes(query) ||
                        med.descripcion.toLowerCase().includes(query)
                    )
                    .map(med => ({ ...med, categoria }))
            );
    };

    const buscarExamenes = (query) => {
        if (!query.trim()) {
            return Object.entries(examenesPorCategoria)
                .filter(([categoria]) => categoria === categoriaExamenActual)
                .flatMap(([categoria, examenes]) =>
                    examenes.map(ex => ({ ...ex, categoria }))
                );
        }

        query = query.toLowerCase();
        return Object.entries(examenesPorCategoria)
            .flatMap(([categoria, examenes]) =>
                examenes
                    .filter(ex =>
                        ex.nombre.toLowerCase().includes(query) ||
                        ex.descripcion.toLowerCase().includes(query)
                    )
                    .map(ex => ({ ...ex, categoria }))
            );
    };

    return (
        <main className="mt-24 max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
                {/* Sección de Recetas */}
                <div className="col-span-6">
                    <div className="glass-effect rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-light text-gray-800">Receta Médica</h2>
                            <button
                                onClick={() => setModalRecetasAbierto(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                            >
                                <FontAwesomeIcon icon="plus" className="mr-2" />
                                Agregar Medicamento
                            </button>
                        </div>

                        {/* Lista de medicamentos seleccionados */}
                        <div className="space-y-4">
                            {Array.from(medicamentosSeleccionados).map(id => {
                                const medicamento = Object.values(medicamentosPorCategoria)
                                    .flatMap(meds => meds)
                                    .find(med => med.id === id);

                                if (!medicamento) return null;

                                return (
                                    <div key={id} className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-600">
                                                    <FontAwesomeIcon icon={getIconoCategoriaMedicamento(medicamento.categoria)} />
                                                </span>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{medicamento.nombre}</h4>
                                                    <p className="text-xs text-gray-500">{medicamento.descripcion}</p>
                                                    <p className="text-xs text-emerald-600 mt-0.5">{medicamento.presentacion}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleMedicamento(id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FontAwesomeIcon icon="trash" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sección de Exámenes */}
                <div className="col-span-6">
                    <div className="glass-effect rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-light text-gray-800">Exámenes</h2>
                            <button
                                onClick={() => setModalExamenesAbierto(true)}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                            >
                                <FontAwesomeIcon icon="plus" className="mr-2" />
                                Agregar Examen
                            </button>
                        </div>

                        {/* Lista de exámenes seleccionados */}
                        <div className="space-y-4">
                            {Array.from(examenesSeleccionados).map(id => {
                                const examen = Object.values(examenesPorCategoria)
                                    .flatMap(exs => exs)
                                    .find(ex => ex.id === id);

                                if (!examen) return null;

                                return (
                                    <div key={id} className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-lg text-purple-600">
                                                    <FontAwesomeIcon icon={getIconoCategoriaExamen(examen.categoria)} />
                                                </span>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{examen.nombre}</h4>
                                                    <p className="text-xs text-gray-500">{examen.descripcion}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleExamen(id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FontAwesomeIcon icon="trash" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Recetas */}
            {modalRecetasAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-medium text-gray-900">Agregar Medicamento</h3>
                                <button
                                    onClick={() => setModalRecetasAbierto(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FontAwesomeIcon icon="times" />
                                </button>
                            </div>

                            {/* Buscador */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar medicamento..."
                                        value={busquedaMedicamento}
                                        onChange={(e) => setBusquedaMedicamento(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    <FontAwesomeIcon
                                        icon="search"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Categorías */}
                            <div className="flex space-x-2 mb-6">
                                {Object.keys(medicamentosPorCategoria).map(categoria => (
                                    <button
                                        key={categoria}
                                        onClick={() => setCategoriaMedicamentoActual(categoria)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoria === categoriaMedicamentoActual
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {categoria}
                                    </button>
                                ))}
                            </div>

                            {/* Lista de medicamentos */}
                            <div className="overflow-y-auto max-h-[400px]">
                                {buscarMedicamentos(busquedaMedicamento).map(medicamento => (
                                    <div
                                        key={medicamento.id}
                                        onClick={() => toggleMedicamento(
                                            medicamento.id,
                                            medicamento.nombre,
                                            medicamento.descripcion,
                                            medicamento.presentacion,
                                            medicamento.categoria
                                        )}
                                        className="p-3 hover:bg-emerald-50 rounded-lg cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-600">
                                                    <FontAwesomeIcon icon={getIconoCategoriaMedicamento(medicamento.categoria)} />
                                                </span>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                                                            {medicamento.categoria}
                                                        </span>
                                                        <h4 className="text-sm font-medium text-gray-900">{medicamento.nombre}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{medicamento.descripcion}</p>
                                                    <p className="text-xs text-emerald-600 mt-0.5">{medicamento.presentacion}</p>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                {medicamentosSeleccionados.has(medicamento.id) ? (
                                                    <span className="text-emerald-500">
                                                        <FontAwesomeIcon icon="check-circle" />
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 opacity-0 group-hover:opacity-100">
                                                        <FontAwesomeIcon icon="plus-circle" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Exámenes */}
            {modalExamenesAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-medium text-gray-900">Agregar Examen</h3>
                                <button
                                    onClick={() => setModalExamenesAbierto(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FontAwesomeIcon icon="times" />
                                </button>
                            </div>

                            {/* Buscador */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar examen..."
                                        value={busquedaExamen}
                                        onChange={(e) => setBusquedaExamen(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <FontAwesomeIcon
                                        icon="search"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Categorías */}
                            <div className="flex space-x-2 mb-6">
                                {Object.keys(examenesPorCategoria).map(categoria => (
                                    <button
                                        key={categoria}
                                        onClick={() => setCategoriaExamenActual(categoria)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoria === categoriaExamenActual
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {categoria}
                                    </button>
                                ))}
                            </div>

                            {/* Lista de exámenes */}
                            <div className="overflow-y-auto max-h-[400px]">
                                {buscarExamenes(busquedaExamen).map(examen => (
                                    <div
                                        key={examen.id}
                                        onClick={() => toggleExamen(
                                            examen.id,
                                            examen.nombre,
                                            examen.descripcion,
                                            examen.categoria
                                        )}
                                        className="p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-lg text-purple-600">
                                                    <FontAwesomeIcon icon={getIconoCategoriaExamen(examen.categoria)} />
                                                </span>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                                            {examen.categoria}
                                                        </span>
                                                        <h4 className="text-sm font-medium text-gray-900">{examen.nombre}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{examen.descripcion}</p>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                {examenesSeleccionados.has(examen.id) ? (
                                                    <span className="text-purple-500">
                                                        <FontAwesomeIcon icon="check-circle" />
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 opacity-0 group-hover:opacity-100">
                                                        <FontAwesomeIcon icon="plus-circle" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
} 