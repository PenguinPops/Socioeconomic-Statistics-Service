'use client';

import { useState } from 'react';
import usersData from '@/app/mock/users.json';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const AdminPage = () => {
    const [users, setUsers] = useState(usersData);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditForm({
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role
        });
    };

    const handleSave = (id) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, ...editForm } : user
        ));
        setEditingId(null);
    };

    const handleDelete = (id) => {
        setUsers(users.filter(user => user.id !== id));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const { data: session, status } = useSession()

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect('/login?error=SessionRequired');
    }

    if(session.user.role != "admin") {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Brak dostępu</h1>
                <p className="text-gray-700">Nie masz dostępu do tych treści - dostęp wyłącznie dla administratora.</p>
            </div>
            </div>
        );
    }
    return (

        <div className="flex h-screen">


            {/* Main content */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === user.id ? (
                                            <input
                                                type="text"
                                                name="username"
                                                value={editForm.username}
                                                onChange={handleInputChange}
                                                className="border rounded p-1 w-full"
                                            />
                                        ) : (
                                            user.username
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === user.id ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editForm.email}
                                                onChange={handleInputChange}
                                                className="border rounded p-1 w-full"
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === user.id ? (
                                            <select
                                                name="role"
                                                value={editForm.role}
                                                onChange={handleInputChange}
                                                className="border rounded p-1 w-full"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex">
                                        {editingId === user.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(user.id)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Password field (only shown when editing) */}
                {editingId && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">
                        <h3 className="font-medium mb-2">Change Password</h3>
                        <input
                            type="password"
                            name="password"
                            placeholder="New password"
                            value={editForm.password}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full max-w-md"
                        />
                        <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;