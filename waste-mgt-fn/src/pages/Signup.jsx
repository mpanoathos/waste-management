import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setname] = useState("");
    const [message, setMessage] = useState("");
    const [userRole, setUserRole] = useState("user"); // Add state for user type

    const handleSignup = async (event) => {
        event.preventDefault();
        setMessage(""); // Reset message state
        try {
            const res = await fetch("http://localhost:5000/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, userRole }), // Include userType in the request body
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed.");
            setMessage("User registered successfully!");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
                {message && <p className="text-green-500 text-sm">{message}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                <input
                        type="text"
                        placeholder="Username"
                        value={name}
                        onChange={(e) => setname(e.target.value)}
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
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                        Sign Up
                    </button>
                    <Link to="/" className="block text-center text-blue-500 hover:underline">Already have an account? Login</Link>
                </form>
            </div>
        </div>
    );
};

export default Signup;
