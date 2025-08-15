import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiAdminCreateUser } from '../../services/api';
import { NewUser, UserRole } from '../../types';
import { THEME } from '../../constants';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import ImageUpload from '../Common/ImageUpload';
import BackButton from '../Common/BackButton';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewUser>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.EMPLOYEE,
    phone: '',
    department: '',
    joinDate: '',
    profilePictureUrl: null,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelected = (base64Image: string | null) => {
    setFormData({ ...formData, profilePictureUrl: base64Image });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await apiAdminCreateUser(formData);
      alert('User created successfully!');
      navigate('/app/admin/employees');
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputBaseClasses = `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-${THEME.secondary} focus:border-${THEME.secondary} sm:text-sm placeholder-gray-400`;
  const selectBaseClasses = `mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-${THEME.secondary} focus:border-${THEME.secondary} sm:text-sm`;

  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto my-8`} >
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold text-${THEME.primary} flex items-center`} >
          <UserPlusIcon className="h-6 w-6 mr-2" />
          Add New User
        </h2>
        <BackButton to="/app/admin/employees" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-4">
          <ImageUpload 
            onImageSelected={handleImageSelected} 
            currentImageUrl={formData.profilePictureUrl}
            label="User Profile Picture (Optional)"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className={`block text-sm font-medium text-${THEME.accentText}`} >First Name</label>
            <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleInputChange} className={inputBaseClasses} required />
          </div>
          <div>
            <label htmlFor="lastName" className={`block text-sm font-medium text-${THEME.accentText}`} >Last Name</label>
            <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleInputChange} className={inputBaseClasses} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className={`block text-sm font-medium text-${THEME.accentText}`} >Username</label>
            <input type="text" name="username" id="username" value={formData.username} onChange={handleInputChange} className={inputBaseClasses} required />
          </div>
          <div>
            <label htmlFor="email" className={`block text-sm font-medium text-${THEME.accentText}`} >Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className={inputBaseClasses} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className={`block text-sm font-medium text-${THEME.accentText}`} >Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} className={inputBaseClasses} required placeholder="Min. 6 characters" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium text-${THEME.accentText}`} >Confirm Password</label>
            <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputBaseClasses} required />
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="role" className={`block text-sm font-medium text-${THEME.accentText}`} >Role</label>
            <select name="role" id="role" value={formData.role} onChange={handleInputChange} className={selectBaseClasses} required>
              <option value={UserRole.EMPLOYEE}>Employee</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="department" className={`block text-sm font-medium text-${THEME.accentText}`} >Department</label>
            <input type="text" name="department" id="department" value={formData.department || ''} onChange={handleInputChange} className={inputBaseClasses} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className={`block text-sm font-medium text-${THEME.accentText}`} >Phone</label>
            <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleInputChange} className={inputBaseClasses} />
          </div>
          <div>
            <label htmlFor="joinDate" className={`block text-sm font-medium text-${THEME.accentText}`} >Join Date</label>
            <input type="date" name="joinDate" id="joinDate" value={formData.joinDate || ''} onChange={handleInputChange} className={inputBaseClasses} />
          </div>
        </div>

        {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/app/admin/employees')}
            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-${THEME.primaryText} bg-${THEME.primary} hover:bg-opacity-85 disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
