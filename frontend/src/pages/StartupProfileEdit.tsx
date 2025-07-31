import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, getUserId } from '../utils/auth';
import { Edit, Save, X, Building, DollarSign, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface StartupProfile {
  id: number;
  user_id: number;
  company_name: string;
  website_link: string;
  industry: string;
  company_description: string;
  founding_date: string;
  team_size: number;
  district: string;
  state: string;
  social_media_1: string;
  social_media_2: string;
  business_model_description: string;
  total_paying_customers: number;
  monthly_customer_growth_rate: number;
  customer_acquisition_cost: number;
  customer_lifetime_value: number;
  competitive_advantage: string;
  product_demo_video_link: string;
  pre_money_valuation: number;
  amount_seeking: number;
  investment_type: string;
  max_equity_percentage: number;
  funding_stage: string;
  total_funding_raised: number;
  last_round_amount: number;
  last_round_date: string;
  key_previous_investors: string;
  pitch_deck_filename: string;
  created_at: string;
  updated_at: string;
}

const StartupProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<StartupProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE_URL}/startup-profile/user/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Prepare data for submission - convert empty strings to null for date fields
      const submitData = { ...editedProfile };
      
      // Convert empty strings to undefined for date fields
      if (submitData.last_round_date === '') {
        submitData.last_round_date = undefined;
      }
      if (submitData.founding_date === '') {
        submitData.founding_date = undefined;
      }
      
      const response = await fetch(`${API_BASE_URL}/startup-profile/${profile?.user_id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No profile found</h3>
          <p className="text-gray-600 mb-4">You need to create a startup profile first.</p>
          <button
            onClick={() => navigate('/startup-profile-create')}
            className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.company_name}</h1>
              <p className="text-gray-600 mt-1">Startup Profile</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="company_name"
                    value={editedProfile.company_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website_link"
                    value={editedProfile.website_link || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profile.website_link ? (
                      <a href={profile.website_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        {profile.website_link}
                      </a>
                    ) : 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                {isEditing ? (
                  <select
                    name="industry"
                    value={editedProfile.industry || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Energy">Energy</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.industry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="team_size"
                    value={editedProfile.team_size || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.team_size} people</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="district"
                      placeholder="District"
                      value={editedProfile.district || ''}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={editedProfile.state || ''}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">{profile.district}, {profile.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founded</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="founding_date"
                    value={editedProfile.founding_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">{new Date(profile.founding_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
              {isEditing ? (
                <textarea
                  name="company_description"
                  rows={4}
                  value={editedProfile.company_description || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              ) : (
                <p className="text-gray-900 leading-relaxed">{profile.company_description}</p>
              )}
            </div>
          </div>

          {/* Business Model */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Business Model</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Model Description</label>
                {isEditing ? (
                  <textarea
                    name="business_model_description"
                    rows={4}
                    value={editedProfile.business_model_description || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed">{profile.business_model_description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Paying Customers</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="total_paying_customers"
                      value={editedProfile.total_paying_customers || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.total_paying_customers?.toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Growth Rate</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      name="monthly_customer_growth_rate"
                      value={editedProfile.monthly_customer_growth_rate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.monthly_customer_growth_rate}%</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Competitive Advantage</label>
                {isEditing ? (
                  <textarea
                    name="competitive_advantage"
                    rows={3}
                    value={editedProfile.competitive_advantage || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed">{profile.competitive_advantage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Funding Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Funding Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Seeking</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="amount_seeking"
                    value={editedProfile.amount_seeking || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">${profile.amount_seeking?.toLocaleString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Stage</label>
                {isEditing ? (
                  <select
                    name="funding_stage"
                    value={editedProfile.funding_stage || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Stage</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C">Series C</option>
                    <option value="Growth">Growth</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.funding_stage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Raised</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="total_funding_raised"
                    value={editedProfile.total_funding_raised || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">${profile.total_funding_raised?.toLocaleString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
                {isEditing ? (
                  <select
                    name="investment_type"
                    value={editedProfile.investment_type || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Equity">Equity</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="Debt">Debt</option>
                    <option value="Revenue Share">Revenue Share</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.investment_type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pitch Deck */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Pitch Deck</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">{profile.pitch_deck_filename || 'No pitch deck uploaded'}</p>
                <p className="text-sm text-gray-600">Uploaded when profile was created</p>
              </div>
              {profile.pitch_deck_filename && (
                <button
                  onClick={() => {
                    // This would trigger pitch deck download
                    alert('Pitch deck download functionality would be implemented here');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/startup-dashboard')}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupProfileEdit; 