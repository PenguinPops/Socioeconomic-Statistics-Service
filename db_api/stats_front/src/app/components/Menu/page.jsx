import { MdDisplaySettings } from "react-icons/md"; //Wizualizacja
import { MdBarChart } from "react-icons/md"; //Analiza
import { MdFolder } from "react-icons/md"; //Surowe dane 
import { MdCode } from "react-icons/md"; //API 
import { IoMdPerson } from "react-icons/io"; //User icon
import Image from 'next/image';

import React from 'react';

const Menu = ({ user }) => {
    return (
        <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col text-gray-700">
            {/* logo */}
            <div className="mt-auto">
                <div className="flex items-center p-2 rounded-lg">
                    <div className="mr-3">
                        <Image
                            src="/images/logo.png"
                            alt="logo"
                            width={40}
                            height={40}
                        />
                    </div>
                    <div>
                        <p className="font-bold">Dane gospodarcze</p>
                        <p className="text-sm text-gray-500">Polska</p>
                    </div>
                </div>
            </div>

            {/* Menu główne */}
            <nav className="flex-1">
                <ul className="space-y-2">
                    <MenuItem icon={<MdDisplaySettings size={20} />} text="Wizualizacja" href="/wizualizacja" />
                    <MenuItem icon={<MdBarChart size={20} />} text="Analiza" href="/analiza" />
                    <MenuItem icon={<MdFolder size={20} />} text="Surowe Dane" href="/surowedane" />
                    <MenuItem icon={<MdCode size={20} />} text="API" href="/api" />
                </ul>
            </nav>

            {/* Profil użytkownika */}
            <div className="mt-auto">
                <div className="flex items-center p-2 rounded-lg hover:bg-blue-700 hover:text-white transition">
                    {user.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <Image
                                src={user.avatar}
                                alt="User avatar"
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                            <IoMdPerson className="text-white" size={20} />
                        </div>
                    )}
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Komponent pomocniczy dla pojedynczego elementu menu
const MenuItem = ({ icon, text, href }) => {
    return (
        <li>
            <a
                href={href}
                className="flex items-center p-3 rounded-lg hover:bg-blue-700 hover:text-white transition"
            >
                <span className="mr-3 text-lg">{icon}</span>
                <span>{text}</span>
            </a>
        </li>
    );
};

export default Menu;