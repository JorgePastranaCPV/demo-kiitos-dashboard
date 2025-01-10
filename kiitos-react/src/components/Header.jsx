import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Header() {
    return (
        <header className="bg-white shadow-sm fixed w-full top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-4">
                        <img
                            src="/logo.gif"
                            alt="Kiitos Care"
                            className="h-14 w-auto invert brightness-50"
                        />
                        <span className="text-2xl font-light text-gray-800">Kiitos Care</span>
                    </Link>

                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center space-x-2 text-lg text-gray-600 hover:text-gray-900">
                            <span>Dr. Juan Pérez</span>
                            <FontAwesomeIcon icon="chevron-down" className="text-base" />
                        </Menu.Button>

                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        to="/perfil"
                                        className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-base text-gray-700`}
                                    >
                                        Ver Perfil
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-base text-gray-700`}
                                    >
                                        Salir del Sistema
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Menu>
                </div>
            </div>
        </header>
    );
} 