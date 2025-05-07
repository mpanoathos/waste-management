
export const isAuthenticated = () => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  return !!token; // Return true if the token exists, false otherwise
};