import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';

console.log('Cargando rutas...'); // Para debug

const routes = [
    {
        path: '/',
        element: <Dashboard />,
        exact: true
    },
    {
        path: '/agenda',
        element: <Agenda />,
        exact: true
    }
];

console.log('Rutas configuradas:', routes); // Para debug

export default routes; 