import React, { useState, useEffect } from 'react';
import api from '../api';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    company: '',
    website: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        alert('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/api/profile', profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated');
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleDownloadVCF = () => {
    const token = localStorage.getItem('token');
    api
      .get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const userId = response.data._id;
        window.open(`${process.env.REACT_APP_API_URL}/vcf/${userId}`);
      })
      .catch(() => {
        alert('Failed to download VCF');
      });
  };

  return (
    <div>
      <h2>Profile</h2>
      <input name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
      <input name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone" />
      <input name="company" value={profile.company} onChange={handleChange} placeholder="Company" />
      <input name="website" value={profile.website} onChange={handleChange} placeholder="Website" />
      <button onClick={handleUpdate}>Update Profile</button>
      <button onClick={handleDownloadVCF}>Download VCF</button>
    </div>
  );
}

export default Profile;
