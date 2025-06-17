import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import wasteManagementImage from '../assets/images/waste-management-segregation-bins.jpg';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState(null);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            toast.success("Login successful!");
        }
    }, [token]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:5000/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 403 && data.approvalStatus === 'PENDING') {
                    toast.info("Your company account is pending approval. Please wait for admin approval.");
                } else {
                    throw new Error(data.message || "Login failed");
                }
                return;
            }

            setToken(data.token);
            localStorage.setItem("role", data.role);
            
            if (data.role === "COMPANY") {
                navigate("/map-view");
            } else if (data.role === "ADMIN") {
                navigate("/admin-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/user/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send reset email");

            toast.success("If an account exists, a password reset email will be sent.");
            setShowForgotPasswordModal(false);
        } catch (err) {
            toast.error(err.message || "Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Section - Welcome Message */}
            <div 
                className="hidden lg:flex lg:w-1/2 text-gray-900 p-12 flex-col justify-center items-center relative overflow-hidden transition-all duration-500 hover:shadow-2xl"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${wasteManagementImage})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#f8f8f8',
                    minHeight: '100vh',
                    boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.15)'
                }}
            >
                <div className="relative z-10 text-center max-w-lg transform transition-all duration-500 hover:scale-105">
                    <div className="mb-8">
                        <div className="w-20 h-1 bg-gray-800 mx-auto mb-4 rounded-full"></div>
                        <h1 className="text-5xl font-bold mb-6 text-gray-900 drop-shadow-lg tracking-wide">
                            Waste Collection System
                        </h1>
                        <div className="w-20 h-1 bg-gray-800 mx-auto mb-4 rounded-full"></div>
                    </div>
                    <p className="text-xl text-gray-800 drop-shadow-md leading-relaxed">
                        Sign in to continue managing waste efficiently.
                    </p>
                    <div className="mt-8 flex justify-center space-x-4">
                        <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-700">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5" />
                                    ) : (
                                        <FaEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowForgotPasswordModal(true)}
                                className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full transform transition-all duration-300 scale-100">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h3>
                            <p className="text-gray-600">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-gray-900 placeholder-gray-500"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:bg-gray-800 shadow-lg hover:shadow-xl"
                                >
                                    Send Reset Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPasswordModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:bg-gray-200 shadow hover:shadow-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default Login;
