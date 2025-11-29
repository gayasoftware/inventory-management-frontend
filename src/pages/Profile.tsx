import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateUser, User, getUserAddresses, createUserAddress, updateUserAddress, Address } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileFormData {
    username: string;
    full_name: string;
    email: string;
    street_address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>();

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const addressesData = await getUserAddresses();
                setAddresses(addressesData);

                // Get default address (first one or the one marked as default)
                const defaultAddress = addressesData.find(addr => addr.is_default) || addressesData[0];

                if (user) {
                    reset({
                        username: user.username || '',
                        full_name: user.full_name || '',
                        email: user.email || '',
                        street_address: defaultAddress?.street_address || '',
                        city: defaultAddress?.city || '',
                        state: defaultAddress?.state || '',
                        pincode: defaultAddress?.pincode || '',
                        country: defaultAddress?.country || 'India',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
            }
        };

        fetchAddresses();
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);
        try {
            // Update user profile first
            const updateData: Partial<User> = {};
            if (data.username !== user?.username) updateData.username = data.username;
            if (data.full_name !== user?.full_name) updateData.full_name = data.full_name;
            if (data.email !== user?.email) updateData.email = data.email;

            let profileUpdated = false;
            if (Object.keys(updateData).length > 0) {
                await updateUser(updateData);
                profileUpdated = true;
            }

            // Handle address updates
            const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
            const addressChanged =
                (data.street_address !== (defaultAddress?.street_address || '')) ||
                (data.city !== (defaultAddress?.city || '')) ||
                (data.state !== (defaultAddress?.state || '')) ||
                (data.pincode !== (defaultAddress?.pincode || '')) ||
                (data.country !== (defaultAddress?.country || 'India'));

            if (addressChanged && (data.street_address || data.city || data.state)) {
                const addressData = {
                    label: 'Home',
                    street_address: data.street_address,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    country: data.country || 'India',
                    is_default: true
                };

                if (defaultAddress) {
                    // Update existing address
                    await updateUserAddress(defaultAddress.id!, addressData);
                } else {
                    // Create new address
                    await createUserAddress(addressData);
                }
            }

            if (profileUpdated || addressChanged) {
                toast.success('Profile updated successfully');
            } else {
                toast('No changes to update', { icon: 'ℹ️' });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Profile</h1>

            <div className="glass-panel rounded-xl shadow-lg p-8 animate-slide-up">
                <div className="mb-6 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <div className="text-sm text-gray-500">Username</div>
                    <div className="font-semibold text-lg text-gray-900">{user?.username}</div>
                </div>

                <div className="mb-8 text-center">
                    <div className="text-sm text-gray-500">Role</div>
                    <div className="font-semibold capitalize text-gray-900 inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">{user?.role}</div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            {...register('username', { required: 'Username is required' })}
                            className="input-field"
                            placeholder="Enter your username"
                        />
                        {errors.username && (
                            <span className="text-red-500 text-xs mt-1 block">
                                {errors.username.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            {...register('full_name', { required: 'Full name is required' })}
                            className="input-field"
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
                            className="input-field"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <span className="text-red-500 text-xs mt-1 block">
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <textarea
                                    {...register('street_address')}
                                    className="input-field"
                                    placeholder="Enter your street address"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        {...register('city')}
                                        className="input-field"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        {...register('state')}
                                        className="input-field"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pincode
                                    </label>
                                    <input
                                        {...register('pincode')}
                                        className="input-field"
                                        placeholder="Pincode"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        {...register('country')}
                                        className="input-field"
                                        placeholder="Country"
                                        defaultValue="India"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-2.5"
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
