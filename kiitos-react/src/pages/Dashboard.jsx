import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const cards = [
    {
        title: 'Lista de Pacientes',
        description: 'Gestione sus pacientes y horarios de atención',
        icon: 'user-friends',
        link: '/pacientes',
        color: 'bg-blue-500'
    },
    {
        title: 'Agenda Médica',
        description: 'Gestione citas y disponibilidad de médicos',
        icon: 'calendar-alt',
        link: '/agenda',
        color: 'bg-indigo-500'
    },
    {
        title: 'Profesionales',
        description: 'Administre profesionales y sus horarios',
        icon: 'user-clock',
        link: '/profesionales',
        color: 'bg-emerald-500'
    },
    {
        title: 'Productividad',
        description: 'Analice su rendimiento y estadísticas',
        icon: 'chart-line',
        link: '/productividad',
        color: 'bg-orange-500'
    }
];

const stats = [
    {
        title: 'Pacientes Hoy',
        value: '12',
        icon: 'user-clock',
        color: 'from-blue-400 to-blue-600'
    },
    {
        title: 'Tiempo Promedio',
        value: '25 min',
        icon: 'clock',
        color: 'from-indigo-400 to-indigo-600'
    },
    {
        title: 'Eficiencia',
        value: '94%',
        icon: 'chart-pie',
        color: 'from-emerald-400 to-emerald-600'
    },
    {
        title: 'Satisfacción',
        value: '4.8/5',
        icon: 'smile',
        color: 'from-orange-400 to-orange-600'
    }
];

export default function Dashboard() {
    return (
        <div className="relative z-10">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-light text-gray-800 mb-3">
                    Bienvenido al Sistema
                </h1>
                <p className="text-xl text-gray-600">
                    Gestione su práctica médica de manera eficiente
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {cards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.link}
                        className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex flex-col h-full">
                            <div className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white transform group-hover:scale-110 transition-transform duration-300`}>
                                <FontAwesomeIcon icon={card.icon} size="lg" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {card.title}
                            </h3>
                            <p className="text-gray-600 text-sm flex-grow">
                                {card.description}
                            </p>
                            <div className="flex items-center mt-6 text-gray-600 group-hover:text-gray-900">
                                <span className="text-sm font-medium">Acceder</span>
                                <FontAwesomeIcon
                                    icon="arrow-right"
                                    className="ml-2 text-sm transform group-hover:translate-x-1 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                <FontAwesomeIcon icon={stat.icon} size="lg" />
                            </div>
                            <div className="ml-6">
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
