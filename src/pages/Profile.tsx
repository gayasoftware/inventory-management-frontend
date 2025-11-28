import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateUser, User } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileFormData {
    full_name: string;
    email: string;
    address: string;
}

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>();

    useEffect(() => {
        // Pre-populate form with current user data
        if (user) {
            reset({
                full_name: user.full_name || '',
                email: user.email || '',
                address: user.address || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);
        try {
            // Only send fields that changed
            const updateData: Partial<User> = {};
            if (data.full_name !== user?.full_name) updateData.full_name = data.full_name;
            if (data.email !== user?.email) updateData.email = data.email;
            if (data.address !== user?.address) updateData.address = data.address;

            if (Object.keys(updateData).length === 0) {
                toast('No changes to update', { icon: 'ℹ️' });
                return;
            }

            await updateUser(updateData);
            toast.success('Profile updated successfully');

            // We could manually update the user in AuthContext here
            // But the user data will refresh on next login
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <h1 className="text-3xl font-bold mb-8 text-center">Profile</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <div className="text-sm text-gray-600">Username</div>
                    <div className="font-semibold">{user?.username}</div>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-gray-600">Role</div>
                    <div className="font-semibold capitalize">{user?.role}</div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            {...register('full_name', { required: 'Full name is required' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your full name"
                        />
                        {errors.full_name && (
                            <span className="text-red-500 text-xs mt-1 block">
                                {errors.full_name.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <span className="text-red-500 text-xs mt-1 block">
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            {...register('address', { required: 'Address is required' })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your delivery address"
                        />
                        {errors.address && (
                            <span className="text-red-500 text-xs mt-1 block">
                                {errors.address.message}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
