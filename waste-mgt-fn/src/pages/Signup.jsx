import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [userRole, setUserRole] = useState("user");
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, userRole }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed.");
            toast.success("Signup successful! Please login."); // Show success toast
            setTimeout(() => {
                navigate("/"); // Redirect to login page after 2 seconds
            }, 2000);
        } catch (error) {
            toast.error("Something went wrong."); // Show error toast
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/2 bg-blue-500 text-white flex flex-col justify-center items-center p-10">
                <h1 className="text-4xl font-bold mb-4">Welcome to Smart Waste Management</h1>
                <p className="text-lg text-center">
                    Our system helps you efficiently manage waste collection and disposal. 
                    Join us in making the environment cleaner and greener by using our smart tools.
                </p>
            </div>
            <div className="w-1/2 flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="company">Company</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        Sign Up
                    </button>
                    <Link to="/" className="block text-center text-blue-500 hover:underline">
                        Already have an account? Login
                    </Link>
                </form>
            </div>
            </div>
            <ToastContainer /> {/* Add ToastContainer to render toast messages */}
        </div>
    );
};

export default Signup;