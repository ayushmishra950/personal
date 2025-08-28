import React, { useState } from 'react';
  import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
    const {email} = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : "";
console.log(email)

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setError('');
      setSuccess('');
    } catch (error) {
      console.error("Error handling form change:", error);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const {email} = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : "";
  const { newPassword, confirmPassword } = formData;

  if (!email || !confirmPassword || !newPassword) {
    setError('All fields are required.');
    return;
  }

  else if(confirmPassword !== newPassword){
    setError('Passwords do not match.');
  }

  else if(newPassword.length<6){
    setError('Password must be at least 6 characters long.');
    return;
  }
  

  try {
    const response = await axios.post('http://localhost:5000/graphql', {
      query: `
 mutation newPassword($email: String!, $newPassword: String!) {
  newPassword(email: $email, newPassword: $newPassword)
}
`,
      variables: {
        email ,
        newPassword
      },
    });

    if (response.data.errors) {
      const errorMsg = response.data.errors[0]?.message;
      alert(errorMsg); 
      setError(errorMsg);
      return;
    }
    
    const message = response.data.data.newPassword;

    if (message) {
      alert(message); 
      setSuccess(message);
      navigate('/login');
    } else {
      alert('Something went wrong');
      setError('Something went wrong');
    }

  } catch (err) {
    const errorMsg = err.response?.data?.errors?.[0]?.message || 'Something went wrong';
    setError(errorMsg);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-purple-600">Change Password</h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div> */}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter old password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition duration-300"
        >
          Set New Password
        </button>
      </form>
    </div>
  );
};

export default NewPassword;
