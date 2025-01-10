import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function DashboardCard({ title, description, icon, to, gradientClass }) {
    return (
        <Link to={to} className="group">
            <div className="glass-effect rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden card-hover">
                <div className={`${gradientClass} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                    <FontAwesomeIcon icon={icon} className="text-2xl text-white" />
                </div>
                <h3 className="font-semibold text-xl text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-4">{description}</p>
                <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-all duration-500">
                    <span className="mr-2 text-sm font-medium">Acceder</span>
                    <FontAwesomeIcon icon="arrow-right" className="text-sm" />
                </div>
            </div>
        </Link>
    );
}
