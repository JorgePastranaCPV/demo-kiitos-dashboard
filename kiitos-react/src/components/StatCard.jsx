import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function StatCard({ title, value, icon, iconColor }) {
    return (
        <div className="glass-effect rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 stat-card">
            <div className="flex items-center justify-between">
                <span className="text-gray-600">{title}</span>
                <FontAwesomeIcon icon={icon} className={iconColor} />
            </div>
            <p className="text-3xl font-light mt-2 text-gray-800">{value}</p>
        </div>
    );
}
