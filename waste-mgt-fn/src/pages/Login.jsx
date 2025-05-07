import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState(null);
    const [error, setError] = useState("");
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false); // State for modal visibility
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(""); // State for email in modal
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            toast.success("Login successful!");
            navigate("/dashboard");
        }
    }, [token, navigate]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const res = await fetch("http://localhost:5000/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);
            setToken(data.token);
        } catch (err) {
            toast.error(err.message || "Something went wrong.");
        }
    };

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const res = await fetch("http://localhost:5000/user/forgot-password", { // Correct URL
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });
            const data = await res.json();
    
            if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
            toast.success("Password reset link sent to your email!");
            setShowForgotPasswordModal(false);
        } catch (err) {
            toast.error(err.message);
        }
    };
    

    return (
        <div className="flex h-screen">
            {/* Explanation Section */}
            <div className="w-1/2 bg-blue-500 text-white flex flex-col justify-center items-center p-10">
                <h1 className="text-4xl font-bold mb-4">Welcome to Smart Waste Management</h1>
                <p className="text-lg text-center">
                    Our system helps you efficiently manage waste collection and disposal. 
                    Join us in making the environment cleaner and greener by using our smart tools.
                </p>
            </div>

            {/* Login Form Section */}
            <div className="w-1/2 flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                            Login
                        </button>
                        <Link to="/signup" className="block text-center text-blue-500 hover:underline">Do not have an account? Please sign Up</Link>
                        <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)} // Open modal
                            className="block w-full text-center text-blue-500 hover:underline mt-2"
                        >
                            Forgot Password?
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer />

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                                Send Reset Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForgotPasswordModal(false)} // Close modal
                                className="w-full text-center text-blue-500 hover:underline mt-2"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
