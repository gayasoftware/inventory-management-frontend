import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginFormData {
    username: string;
    password: string;
}

const Login = () => {
    const { register, handleSubmit } = useForm<LoginFormData>();
    const navigate = useNavigate();
    const { login } = useAuth();

    const onSubmit = async (data: LoginFormData) => {
        try {
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('password', data.password);

            const response = await client.post('/auth/token', formData);
            const { access_token } = response.data;

            login(access_token);

            // Hack: Decode token or fetch user info. 
            // Since we don't have a /me endpoint, we'll just store the username.
            // Ideally backend returns user info with token or we have a separate endpoint.
            // Let's manually store a dummy user object for now or decode if we had jwt-decode.
            // We'll just store what we know.
            localStorage.setItem('user', JSON.stringify({ username: data.username, role: 'staff' })); // Defaulting to staff, ideally backend tells us.

            toast.success('Logged in successfully');
            navigate('/');
        } catch (error) {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            {...register('username')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-800">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
