import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InvestorProfileList: React.FC = () => {
  const { id } = useParams(); // user id
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/investor-profile/user/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
        } else {
          setError('Failed to fetch profiles');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl text-white">
        <h2 className="text-2xl font-bold mb-4">Investor Profiles</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-red-200">{error}</div>}
        <ul className="space-y-4">
          {profiles.map(profile => (
            <li key={profile.id} className="bg-white/10 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <img 
                  src={`/${profile.profile_photo_file_path}`} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div><span className="font-semibold">Name:</span> {profile.full_name}</div>
                  <div><span className="font-semibold">Type:</span> {profile.investor_type}</div>
                  <div><span className="font-semibold">Location:</span> {profile.district}, {profile.state}, {profile.country}</div>
                </div>
              </div>
              <div><span className="font-semibold">Created:</span> {new Date(profile.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InvestorProfileList; 