import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { loginContext } = useContext(AuthContext); // להוסיף בשורות הראשונות של הקומפוננטה (ולייבא את useContext ו-AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', formData);
      loginContext({ name: data.name, email: data.email }, data.token); // שימוש ב-Context
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login to tfriends 👋</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email Address:</label>
          <input 
            type="email" 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input 
            type="password" 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;