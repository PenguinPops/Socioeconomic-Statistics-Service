"use client";

import { MdDisplaySettings } from "react-icons/md"; //Wizualizacja
import { MdBarChart } from "react-icons/md"; //Analiza
import { MdFolder } from "react-icons/md"; //Surowe dane 
import { MdCode } from "react-icons/md"; //API 
import { IoMdPerson, IoMdLogOut } from "react-icons/io"; //User icon
import Image from 'next/image';
import { signOut } from "next-auth/react";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const Menu = () => {
    const [showLogout, setShowLogout] = useState(false);

    const pathname = usePathname();

    const { data: session } = useSession();

    const user = session?.user || {}; // Destructure user from session, default to empty object if session is not available

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
                    <MenuItem icon={<MdBarChart size={20} />} text="Analiza" href="/home" isActive={pathname === "/home" || pathname === "/"} />
                    <MenuItem icon={<MdDisplaySettings size={20} />} text="Panel administratora" href="/admin" isActive={pathname === "/admin"} />
                    <MenuItem icon={<MdFolder size={20} />} text="Surowe Dane" href="/surowedane" isActive={pathname === "/surowedane"} />
                    <MenuItem icon={<MdCode size={20} />} text="API" href="/apibuilder" isActive={pathname === "/apibuilder"} />
                </ul>
            </nav>

            {/* Profil użytkownika */}
            {/* Profil użytkownika */}
            <div className="mt-auto">
                {/* Opcja wylogowania - pojawia się po kliknięciu */}
                {showLogout && (
                    <div
                        className="flex items-center p-2 rounded-lg hover:bg-red-600 hover:text-white transition cursor-pointer mb-2"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        <IoMdLogOut className="mr-2" size={18} />
                        <span>Wyloguj się</span>
                    </div>
                )}

                {/* Profil użytkownika */}
                <div
                    className="flex items-center p-2 rounded-lg hover:bg-blue-700 hover:text-white transition cursor-pointer"
                    onClick={() => setShowLogout(!showLogout)}
                >
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
                        {user.name ? (
                            <p className="font-medium">{user.name}</p>
                        ) : (
                            <p className="font-medium">Nieznany użytkownik</p>
                        )}
                        {user.role ? (
                            user.role === "admin" ? (
                                <p className="text-sm text-red-300">Administrator</p>
                            ) : (
                                <p className="text-sm text-gray-500">Użytkownik</p>
                            )
                        ) : (
                            <p className="text-sm text-gray-500">Brak roli</p>
                        )}
                        {user.email ? (
                            <p className="text-sm text-gray-500">{user.email}</p>
                        ) : (
                            <p className="text-sm text-gray-500">Brak adresu e-mail</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Komponent pomocniczy dla pojedynczego elementu menu
const MenuItem = ({ icon, text, href, isActive }) => {
    return (
        <li>
            <a
                href={href}
                className={`flex items-center p-3 rounded-lg hover:bg-blue-700 hover:text-white transition ${isActive ? "bg-blue-700 text-white" : "hover:bg-blue-700 hover:text-white"}`}
            >
                <span className="mr-3 text-lg">{icon}</span>
                <span>{text}</span>
            </a>
        </li>
    );
};

export { Menu };