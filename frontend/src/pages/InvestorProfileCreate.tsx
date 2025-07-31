import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';

const InvestorProfileCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    country: '',
    state: '',
    district: '',
    linkedin_profile: '',
    investor_type: '',
    firm_name: '',
    investment_experience: '',
    years_of_investment_experience: '',
    professional_background: [] as string[],
    previous_experience: '',
    investment_stages: [] as string[],
    check_size_range: '',
    geographic_focus: [] as string[],
    industry_focus: [] as string[],
    investment_philosophy: '',
    decision_timeline: '',
    number_of_portfolio_companies: '',
    notable_investments: '',
    successful_exits: '',
    post_investment_involvement: '',
    areas_of_expertise: [] as string[],
    investment_thesis: '',
    additional_info: '',
    profile_visibility: 'Public',
    contact_permissions: 'Open to all'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/investor-profile/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/investor-dashboard');
      } else {
        const data = await response.json();
        // Handle validation errors properly
        if (data.detail && Array.isArray(data.detail)) {
          // Pydantic validation errors
          const errorMessages = data.detail.map((err: any) => err.msg).join(', ');
          setError(errorMessages);
        } else if (typeof data.detail === 'string') {
          setError(data.detail);
        } else {
          setError('Failed to create profile');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Investor Profile</h1>
          <p className="text-gray-600">Tell startups about your investment preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                District *
              </label>
              <input
                type="text"
                id="district"
                name="district"
                required
                value={formData.district}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="linkedin_profile" className="block text-sm font-medium text-gray-700">
                LinkedIn Profile *
              </label>
              <input
                type="url"
                id="linkedin_profile"
                name="linkedin_profile"
                required
                value={formData.linkedin_profile}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="investor_type" className="block text-sm font-medium text-gray-700">
                Investor Type *
              </label>
              <select
                id="investor_type"
                name="investor_type"
                required
                value={formData.investor_type}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Investor Type</option>
                <option value="Angel Investor">Angel Investor</option>
                <option value="Venture Capitalist">Venture Capitalist</option>
                <option value="Private Equity">Private Equity</option>
                <option value="Corporate Investor">Corporate Investor</option>
                <option value="Family Office">Family Office</option>
                <option value="Accelerator">Accelerator</option>
                <option value="Incubator">Incubator</option>
              </select>
            </div>

            <div>
              <label htmlFor="firm_name" className="block text-sm font-medium text-gray-700">
                Firm Name
              </label>
              <input
                type="text"
                id="firm_name"
                name="firm_name"
                value={formData.firm_name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="investment_experience" className="block text-sm font-medium text-gray-700">
                Investment Experience *
              </label>
              <textarea
                id="investment_experience"
                name="investment_experience"
                required
                value={formData.investment_experience}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describe your investment experience..."
              />
            </div>

            <div>
              <label htmlFor="years_of_investment_experience" className="block text-sm font-medium text-gray-700">
                Years of Investment Experience *
              </label>
              <select
                id="years_of_investment_experience"
                name="years_of_investment_experience"
                required
                value={formData.years_of_investment_experience}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Experience</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="6-10 years">6-10 years</option>
                <option value="More than 10 years">More than 10 years</option>
              </select>
            </div>

            <div>
              <label htmlFor="previous_experience" className="block text-sm font-medium text-gray-700">
                Previous Experience
              </label>
              <textarea
                id="previous_experience"
                name="previous_experience"
                value={formData.previous_experience}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describe your previous work experience..."
              />
            </div>

            <div>
              <label htmlFor="check_size_range" className="block text-sm font-medium text-gray-700">
                Check Size Range *
              </label>
              <select
                id="check_size_range"
                name="check_size_range"
                required
                value={formData.check_size_range}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Check Size</option>
                <option value="$10K - $50K">$10K - $50K</option>
                <option value="$50K - $100K">$50K - $100K</option>
                <option value="$100K - $500K">$100K - $500K</option>
                <option value="$500K - $1M">$500K - $1M</option>
                <option value="$1M - $5M">$1M - $5M</option>
                <option value="$5M+">$5M+</option>
              </select>
            </div>

            <div>
              <label htmlFor="investment_philosophy" className="block text-sm font-medium text-gray-700">
                Investment Philosophy *
              </label>
              <textarea
                id="investment_philosophy"
                name="investment_philosophy"
                required
                value={formData.investment_philosophy}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describe your investment philosophy..."
              />
            </div>

            <div>
              <label htmlFor="decision_timeline" className="block text-sm font-medium text-gray-700">
                Decision Timeline *
              </label>
              <select
                id="decision_timeline"
                name="decision_timeline"
                required
                value={formData.decision_timeline}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Timeline</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="1 month">1 month</option>
                <option value="2-3 months">2-3 months</option>
                <option value="3+ months">3+ months</option>
              </select>
            </div>

            <div>
              <label htmlFor="number_of_portfolio_companies" className="block text-sm font-medium text-gray-700">
                Number of Portfolio Companies
              </label>
              <input
                type="text"
                id="number_of_portfolio_companies"
                name="number_of_portfolio_companies"
                value={formData.number_of_portfolio_companies}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label htmlFor="notable_investments" className="block text-sm font-medium text-gray-700">
                Notable Investments
              </label>
              <textarea
                id="notable_investments"
                name="notable_investments"
                value={formData.notable_investments}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="List your notable investments..."
              />
            </div>

            <div>
              <label htmlFor="successful_exits" className="block text-sm font-medium text-gray-700">
                Successful Exits
              </label>
              <textarea
                id="successful_exits"
                name="successful_exits"
                value={formData.successful_exits}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="List your successful exits..."
              />
            </div>

            <div>
              <label htmlFor="post_investment_involvement" className="block text-sm font-medium text-gray-700">
                Post Investment Involvement *
              </label>
              <select
                id="post_investment_involvement"
                name="post_investment_involvement"
                required
                value={formData.post_investment_involvement}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Select Involvement</option>
                <option value="Board member">Board member</option>
                <option value="Advisor">Advisor</option>
                <option value="Hands-off">Hands-off</option>
                <option value="Quarterly check-ins">Quarterly check-ins</option>
                <option value="Monthly check-ins">Monthly check-ins</option>
              </select>
            </div>

            <div>
              <label htmlFor="investment_thesis" className="block text-sm font-medium text-gray-700">
                Investment Thesis
              </label>
              <textarea
                id="investment_thesis"
                name="investment_thesis"
                value={formData.investment_thesis}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Describe your investment thesis..."
              />
            </div>

            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700">
                Additional Information
              </label>
              <textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          {/* Professional Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Background *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'Entrepreneurship', 'Marketing', 'Sales', 'Operations', 'Legal'].map(background => (
                <label key={background} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.professional_background.includes(background)}
                    onChange={(e) => handleArrayChange('professional_background', background, e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{background}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Investment Stages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Stages *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Late Stage'].map(stage => (
                <label key={stage} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.investment_stages.includes(stage)}
                    onChange={(e) => handleArrayChange('investment_stages', stage, e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{stage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Geographic Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geographic Focus *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['North America', 'Europe', 'Asia', 'Latin America', 'Africa', 'Middle East', 'Global'].map(region => (
                <label key={region} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.geographic_focus.includes(region)}
                    onChange={(e) => handleArrayChange('geographic_focus', region, e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Focus *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Real Estate', 'Transportation', 'Energy', 'Other'].map(industry => (
                <label key={industry} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.industry_focus.includes(industry)}
                    onChange={(e) => handleArrayChange('industry_focus', industry, e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Areas of Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Areas of Expertise *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Product Development', 'Marketing', 'Sales', 'Operations', 'Finance', 'Legal', 'HR', 'Technology', 'Strategy', 'International Expansion'].map(expertise => (
                <label key={expertise} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.areas_of_expertise.includes(expertise)}
                    onChange={(e) => handleArrayChange('areas_of_expertise', expertise, e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{expertise}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Profile Visibility and Contact Permissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-700">
                Profile Visibility *
            </label>
              <select
                id="profile_visibility"
                name="profile_visibility"
              required
                value={formData.profile_visibility}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Invite Only">Invite Only</option>
              </select>
          </div>

          <div>
              <label htmlFor="contact_permissions" className="block text-sm font-medium text-gray-700">
                Contact Permissions *
            </label>
              <select
                id="contact_permissions"
                name="contact_permissions"
                required
                value={formData.contact_permissions}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="Open to all">Open to all</option>
                <option value="Startups only">Startups only</option>
                <option value="By invitation only">By invitation only</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestorProfileCreate; 