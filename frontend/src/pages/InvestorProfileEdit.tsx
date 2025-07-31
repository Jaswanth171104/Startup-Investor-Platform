import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, getUserId } from '../utils/auth';
import { Edit, Save, X, User, Building, DollarSign, MapPin, Briefcase } from 'lucide-react';

interface InvestorProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  country: string;
  state: string;
  district: string;
  linkedin_profile: string;
  investor_type: string;
  firm_name: string;
  investment_experience: string;
  years_of_investment_experience: string;
  professional_background: string[];
  previous_experience: string;
  investment_stages: string[];
  check_size_range: string;
  geographic_focus: string[];
  industry_focus: string[];
  investment_philosophy: string;
  decision_timeline: string;
  number_of_portfolio_companies: string;
  notable_investments: string;
  successful_exits: string;
  post_investment_involvement: string;
  areas_of_expertise: string[];
  investment_thesis: string;
  additional_info: string;
  profile_visibility: string;
  contact_permissions: string;
  profile_photo_filename: string;
  created_at: string;
  updated_at: string;
}

const InvestorProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<InvestorProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = getUserId();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/investor-profile/user/${userId}`, {
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

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[] || []), value]
        : (prev[field as keyof typeof prev] as string[] || []).filter(item => item !== value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/investor-profile/${profile?.user_id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
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
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No profile found</h3>
          <p className="text-gray-600 mb-4">You need to create an investor profile first.</p>
          <button
            onClick={() => navigate('/investor-profile-create')}
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
            <div className="flex items-center gap-4">
              {profile.profile_photo_filename ? (
                <>
                  <img
                    src={`${API_BASE_URL}/uploads/profile_photos/${profile.profile_photo_filename}`}
                    alt={profile.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500"
                    onError={e => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-500 hidden">
                    <User className="w-8 h-8 text-yellow-600" />
                  </div>
                </>
              ) : (
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-500">
                  <User className="w-8 h-8 text-yellow-600" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-600 mt-1">{profile.investor_type} • {profile.firm_name || 'Independent'}</p>
              </div>
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
              <User className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={editedProfile.full_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={editedProfile.phone_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone_number || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="linkedin_profile"
                    value={editedProfile.linkedin_profile || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profile.linkedin_profile ? (
                      <a href={profile.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        View Profile
                      </a>
                    ) : 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2">
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
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={editedProfile.country || ''}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">{profile.district}, {profile.state}, {profile.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Investment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Investment Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investor Type</label>
                {isEditing ? (
                  <select
                    name="investor_type"
                    value={editedProfile.investor_type || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Angel Investor">Angel Investor</option>
                    <option value="Venture Capitalist">Venture Capitalist</option>
                    <option value="Private Equity">Private Equity</option>
                    <option value="Corporate Investor">Corporate Investor</option>
                    <option value="Family Office">Family Office</option>
                    <option value="Accelerator">Accelerator</option>
                    <option value="Incubator">Incubator</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.investor_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firm_name"
                    value={editedProfile.firm_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.firm_name || 'Independent'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check Size Range</label>
                {isEditing ? (
                  <select
                    name="check_size_range"
                    value={editedProfile.check_size_range || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Range</option>
                    <option value="$10K - $50K">$10K - $50K</option>
                    <option value="$50K - $100K">$50K - $100K</option>
                    <option value="$100K - $500K">$100K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M+">$5M+</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.check_size_range}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                {isEditing ? (
                  <select
                    name="years_of_investment_experience"
                    value={editedProfile.years_of_investment_experience || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Experience</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="6-10 years">6-10 years</option>
                    <option value="More than 10 years">More than 10 years</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.years_of_investment_experience}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Philosophy</label>
              {isEditing ? (
                <textarea
                  name="investment_philosophy"
                  rows={4}
                  value={editedProfile.investment_philosophy || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              ) : (
                <p className="text-gray-900 leading-relaxed">{profile.investment_philosophy}</p>
              )}
            </div>
          </div>

          {/* Investment Focus */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Investment Focus</h2>
            </div>
            
            {/* Investment Stages */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Stages</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Late Stage'].map(stage => (
                    <label key={stage} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editedProfile.investment_stages || []).includes(stage)}
                        onChange={(e) => handleArrayChange('investment_stages', stage, e.target.checked)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{stage}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.investment_stages.map((stage, index) => (
                    <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {stage}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Industry Focus */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry Focus</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Real Estate', 'Transportation', 'Energy', 'Other'].map(industry => (
                    <label key={industry} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editedProfile.industry_focus || []).includes(industry)}
                        onChange={(e) => handleArrayChange('industry_focus', industry, e.target.checked)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.industry_focus.map((industry, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {industry}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Geographic Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Focus</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {['North America', 'Europe', 'Asia', 'Latin America', 'Africa', 'Middle East', 'Global'].map(region => (
                    <label key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editedProfile.geographic_focus || []).includes(region)}
                        onChange={(e) => handleArrayChange('geographic_focus', region, e.target.checked)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{region}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.geographic_focus.map((region, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {region}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Professional Background */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Professional Background</h2>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Expertise</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {['Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'Entrepreneurship', 'Marketing', 'Sales', 'Operations', 'Legal'].map(background => (
                    <label key={background} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editedProfile.professional_background || []).includes(background)}
                        onChange={(e) => handleArrayChange('professional_background', background, e.target.checked)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{background}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.professional_background.map((background, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {background}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Previous Experience</label>
              {isEditing ? (
                <textarea
                  name="previous_experience"
                  rows={4}
                  value={editedProfile.previous_experience || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              ) : (
                <p className="text-gray-900 leading-relaxed">{profile.previous_experience || 'Not specified'}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Companies</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="number_of_portfolio_companies"
                    value={editedProfile.number_of_portfolio_companies || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.number_of_portfolio_companies || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision Timeline</label>
                {isEditing ? (
                  <select
                    name="decision_timeline"
                    value={editedProfile.decision_timeline || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Timeline</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2-3 months">2-3 months</option>
                    <option value="3+ months">3+ months</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.decision_timeline}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Thesis</label>
              {isEditing ? (
                <textarea
                  name="investment_thesis"
                  rows={4}
                  value={editedProfile.investment_thesis || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              ) : (
                <p className="text-gray-900 leading-relaxed">{profile.investment_thesis || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/investor-dashboard')}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestorProfileEdit; 