import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Configuración de Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUserFriends,
  faCalendarAlt,
  faChartLine,
  faSearch,
  faUserClock,
  faClock,
  faChartPie,
  faSmile,
  faArrowRight,
  faCalendarPlus,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCalendarTimes,
  faCircle,
  faEdit,
  faTrashAlt,
  faDownload,
  faListAlt,
  faFileExport
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faUserFriends,
  faCalendarAlt,
  faChartLine,
  faSearch,
  faUserClock,
  faClock,
  faChartPie,
  faSmile,
  faArrowRight,
  faCalendarPlus,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCalendarTimes,
  faCircle,
  faEdit,
  faTrashAlt,
  faDownload,
  faListAlt,
  faFileExport
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
