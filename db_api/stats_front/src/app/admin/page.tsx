'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LoadingSpinner } from '@/app/components/LoadingSpinner/page'; // Assuming path is correct
import { saltAndHashPassword } from '@/app/utils/snhpass'; // You'll need this for new user passwords on client before sending, or do it server-side only (recommended)

// It's generally better to hash passwords on the server-side only.
// So, you might not need saltAndHashPassword directly in the AdminPage.
// The API endpoint for creating/updating users should handle hashing.

const AdminPage = () => {
    const [users, setUsers] = useState([]); // Initialize with empty array
    const [isLoadingUsers, setIsLoadingUsers] = useState(true); // For loading users
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        password: '', // For new password input
        role: 'user'
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // For form submission spinner
    const [error, setError] = useState<string | null>(null);

    // For adding a new user
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [addUserForm, setAddUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const { data: session, status } = useSession();

    // Fetch users when component mounts and session is loaded
    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchUsers();
        }
    }, [session]); // Re-run if session changes

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setError(null);
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditForm({
            name: user.name,
            email: user.email,
            password: '', // Clear password field for editing
            role: user.role
        });
        setError(null);
        setShowAddUserForm(false); // Hide add form if editing
    };

    const handleSave = async (id) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = { ...editForm };
            // Only include password if it's being changed (not empty)
            if (!payload.password) {
                delete payload.password;
            }

            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }
            const updatedUser = await response.json();
            setUsers(users.map(user => (user.id === id ? updatedUser : user)));
            setEditingId(null);
        } catch (err) {
            console.error("Error saving user:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }
        setIsSubmitting(true); // Can use a general loading state
        setError(null);
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e, formSetter) => {
        const { name, value } = e.target;
        formSetter(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!addUserForm.password) {
            setError("Password is required for new users.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addUserForm), // Password will be hashed server-side
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }
            const newUser = await response.json();
            setUsers([...users, newUser]); // Add to local state
            setShowAddUserForm(false); // Hide form
            setAddUserForm({ name: '', email: '', password: '', role: 'user' }); // Reset form
        } catch (err) {
            console.error("Error adding user:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (status === 'loading' || (session?.user?.role === 'admin' && isLoadingUsers) ) {
        return <LoadingSpinner />;
    }

    if (!session) {
        redirect('/login?error=SessionRequired');
        return null; // Avoid rendering further while redirecting
    }

    if (session.user.role !== "admin") {
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
        <div className="flex flex-col h-screen"> {/* Changed to flex-col for button placement */}
            {/* Main content */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">User Management</h1>
                    <button
                        onClick={() => {
                            setShowAddUserForm(!showAddUserForm);
                            setEditingId(null); // Hide edit form if adding
                            setError(null);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {showAddUserForm ? 'Cancel' : 'Add New User'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {showAddUserForm && (
                    <form onSubmit={handleAddUser} className="mb-8 p-6 bg-gray-50 rounded-lg shadow text-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text" name="name" placeholder="Name" required
                                value={addUserForm.name} onChange={(e) => handleInputChange(e, setAddUserForm)}
                                className="border rounded p-2 w-full" />
                            <input
                                type="email" name="email" placeholder="Email" required
                                value={addUserForm.email} onChange={(e) => handleInputChange(e, setAddUserForm)}
                                className="border rounded p-2 w-full" />
                            <input
                                type="password" name="password" placeholder="Password" required
                                value={addUserForm.password} onChange={(e) => handleInputChange(e, setAddUserForm)}
                                className="border rounded p-2 w-full" />
                            <select
                                name="role" value={addUserForm.role} onChange={(e) => handleInputChange(e, setAddUserForm)}
                                className="border rounded p-2 w-full">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isSubmitting}
                            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            {isSubmitting ? 'Adding...' : 'Add User'}
                        </button>
                    </form>
                )}


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
                                            <input type="text" name="name" value={editForm.name}
                                                onChange={(e) => handleInputChange(e, setEditForm)}
                                                className="border rounded p-1 w-full" />
                                        ) : ( user.name )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === user.id ? (
                                            <input type="email" name="email" value={editForm.email}
                                                onChange={(e) => handleInputChange(e, setEditForm)}
                                                className="border rounded p-1 w-full" />
                                        ) : ( user.email )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === user.id ? (
                                            <select name="role" value={editForm.role}
                                                onChange={(e) => handleInputChange(e, setEditForm)}
                                                className="border rounded p-1 w-full" >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex">
                                        {editingId === user.id ? (
                                            <>
                                                <button onClick={() => handleSave(user.id)} disabled={isSubmitting}
                                                    className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50">
                                                    {isSubmitting ? 'Saving...' : 'Save'}
                                                </button>
                                                <button onClick={() => { setEditingId(null); setError(null);}}
                                                    className="text-gray-600 hover:text-gray-900">
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(user)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} disabled={isSubmitting}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50">
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                             {users.length === 0 && !isLoadingUsers && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {editingId && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">
                        <h3 className="font-medium mb-2">Change Password (Optional)</h3>
                        <input type="password" name="password" placeholder="New password (leave blank to keep current)"
                            value={editForm.password} onChange={(e) => handleInputChange(e, setEditForm)}
                            className="border rounded p-2 w-full max-w-md" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;