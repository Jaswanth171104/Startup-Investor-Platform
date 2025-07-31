import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, getUserId } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const StartupProfileCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Basic Information
    company_name: '',
    website_link: '',
    industry: '',
    company_description: '',
    founding_date: '',
    team_size: '',
    district: '',
    state: '',
    social_media_1: '',
    social_media_2: '',
    
    // Business Model
    business_model_description: '',
    total_paying_customers: '',
    monthly_customer_growth_rate: '',
    customer_acquisition_cost: '',
    customer_lifetime_value: '',
    competitive_advantage: '',
    product_demo_video_link: '',
    
    // Funding Information
    pre_money_valuation: '',
    amount_seeking: '',
    investment_type: '',
    max_equity_percentage: '',
    funding_stage: '',
    total_funding_raised: '',
    last_round_amount: '',
    last_round_date: '',
    key_previous_investors: '',
    
    // Founders
    founders: [
      {
        name: '',
        educational_qualification: '',
        previous_work_experience: '',
        linkedin_profile: '',
        photo_url: '' // Keep as URL for now
      }
    ],
    
    // Revenue Metrics
    revenue_metrics: {
      monthly_recurring_revenue: '',
      annual_recurring_revenue: '',
      revenue_growth_rate: '',
      monthly_burn_rate: '',
      current_cash_runway: '',
      projected_revenue_12_months: '',
      profitability_timeline: '',
      investment_timeline: ''
    },
    
    // Fund Usage
    fund_usage: {
      product_development_percentage: '',
      marketing_percentage: '',
      team_expansion_percentage: '',
      operations_percentage: ''
    }
  });

  // Pitch deck file
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add basic profile data
      const processedData = {
        ...formData,
        team_size: parseInt(formData.team_size) || 0,
        total_paying_customers: parseInt(formData.total_paying_customers) || 0,
        monthly_customer_growth_rate: parseFloat(formData.monthly_customer_growth_rate) || null,
        customer_acquisition_cost: parseFloat(formData.customer_acquisition_cost) || null,
        customer_lifetime_value: parseFloat(formData.customer_lifetime_value) || null,
        pre_money_valuation: parseInt(formData.pre_money_valuation) || 0,
        amount_seeking: parseInt(formData.amount_seeking) || 0,
        max_equity_percentage: parseFloat(formData.max_equity_percentage) || 0,
        total_funding_raised: parseInt(formData.total_funding_raised) || 0,
        last_round_amount: parseInt(formData.last_round_amount) || 0,
        revenue_metrics: {
          ...formData.revenue_metrics,
          monthly_recurring_revenue: parseInt(formData.revenue_metrics.monthly_recurring_revenue) || 0,
          annual_recurring_revenue: parseInt(formData.revenue_metrics.annual_recurring_revenue) || 0,
          revenue_growth_rate: parseFloat(formData.revenue_metrics.revenue_growth_rate) || null,
          monthly_burn_rate: parseInt(formData.revenue_metrics.monthly_burn_rate) || null,
          current_cash_runway: parseInt(formData.revenue_metrics.current_cash_runway) || null,
          projected_revenue_12_months: parseInt(formData.revenue_metrics.projected_revenue_12_months) || null
        },
        fund_usage: {
          ...formData.fund_usage,
          product_development_percentage: parseFloat(formData.fund_usage.product_development_percentage) || 0,
          marketing_percentage: parseFloat(formData.fund_usage.marketing_percentage) || 0,
          team_expansion_percentage: parseFloat(formData.fund_usage.team_expansion_percentage) || 0,
          operations_percentage: parseFloat(formData.fund_usage.operations_percentage) || 0
        }
      };

      // Remove photo_file from founders data for JSON
      const foundersForJson = processedData.founders.map(founder => ({
        name: founder.name,
        educational_qualification: founder.educational_qualification,
        previous_work_experience: founder.previous_work_experience,
        linkedin_profile: founder.linkedin_profile,
        photo_url: founder.photo_url
      }));

      const profileDataForJson = {
        ...processedData,
        founders: foundersForJson
      };

      // Add JSON data to FormData
      formDataToSend.append('profile_data', JSON.stringify(profileDataForJson));

      // Add pitch deck file
      if (pitchDeckFile) {
        formDataToSend.append('pitch_deck', pitchDeckFile);
      }

      const response = await fetch(`${API_BASE_URL}/startup-profile/create-with-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        navigate('/startup-dashboard');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to create profile');
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

  const handleFounderChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      founders: prev.founders.map((founder, i) => 
        i === index ? { ...founder, [field]: value } : founder
      )
    }));
  };

  const addFounder = () => {
    setFormData(prev => ({
      ...prev,
      founders: [...prev.founders, {
        name: '',
        educational_qualification: '',
        previous_work_experience: '',
        linkedin_profile: '',
        photo_url: '' // Changed from photo_file to photo_url
      }]
    }));
  };

  const removeFounder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      founders: prev.founders.filter((_, i) => i !== index)
    }));
  };

  const handleRevenueMetricsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      revenue_metrics: {
        ...prev.revenue_metrics,
        [field]: value
      }
    }));
  };

  const handleFundUsageChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      fund_usage: {
        ...prev.fund_usage,
        [field]: value
      }
    }));
  };

  const handlePitchDeckUpload = async () => {
    if (!pitchDeckFile) {
      setError('Please select a pitch deck file');
      return;
    }

    setLoading(true); // Use loading state for pitch deck upload
    setError('');

    try {
      const formData = new FormData();
      formData.append('pitch_deck', pitchDeckFile);

      const response = await fetch(`${API_BASE_URL}/startup-profile/upload-pitch-deck`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate('/startup-dashboard');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to upload pitch deck');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPitchDeckFile(file);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Startup Profile</h1>
          <p className="text-gray-600">Tell investors about your startup</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-6">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-yellow-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website Link
                  </label>
                  <input
                    type="url"
                    name="website_link"
                    value={formData.website_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    name="industry"
                    required
                    value={formData.industry}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founding Date *
                  </label>
                  <input
                    type="date"
                    name="founding_date"
                    required
                    value={formData.founding_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size *
                  </label>
                  <input
                    type="number"
                    name="team_size"
                    required
                    value={formData.team_size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media 1
                  </label>
                  <input
                    type="url"
                    name="social_media_1"
                    value={formData.social_media_1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media 2
                  </label>
                  <input
                    type="url"
                    name="social_media_2"
                    value={formData.social_media_2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  name="company_description"
                  required
                  rows={4}
                  value={formData.company_description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Describe your company, mission, and what makes it unique..."
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Business Model */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Model</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Model Description *
                  </label>
                  <textarea
                    name="business_model_description"
                    required
                    rows={4}
                    value={formData.business_model_description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Describe your business model and revenue streams..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Paying Customers *
                    </label>
                    <input
                      type="number"
                      name="total_paying_customers"
                      required
                      value={formData.total_paying_customers}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Customer Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="monthly_customer_growth_rate"
                      value={formData.monthly_customer_growth_rate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Acquisition Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="customer_acquisition_cost"
                      value={formData.customer_acquisition_cost}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Lifetime Value ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="customer_lifetime_value"
                      value={formData.customer_lifetime_value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competitive Advantage *
                  </label>
                  <textarea
                    name="competitive_advantage"
                    required
                    rows={3}
                    value={formData.competitive_advantage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="What makes your startup unique? What are your competitive advantages?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Demo Video Link *
                  </label>
                  <input
                    type="url"
                    name="product_demo_video_link"
                    required
                    value={formData.product_demo_video_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Funding Information */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Funding Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-money Valuation ($) *
                  </label>
                  <input
                    type="number"
                    name="pre_money_valuation"
                    required
                    value={formData.pre_money_valuation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Seeking ($) *
                  </label>
                  <input
                    type="number"
                    name="amount_seeking"
                    required
                    value={formData.amount_seeking}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Type *
                  </label>
                  <select
                    name="investment_type"
                    required
                    value={formData.investment_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Equity">Equity</option>
                    <option value="Convertible Note">Convertible Note</option>
                    <option value="Debt">Debt</option>
                    <option value="Revenue Share">Revenue Share</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Equity Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="max_equity_percentage"
                    required
                    value={formData.max_equity_percentage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Stage *
                  </label>
                  <select
                    name="funding_stage"
                    required
                    value={formData.funding_stage}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Funding Raised ($) *
                  </label>
                  <input
                    type="number"
                    name="total_funding_raised"
                    required
                    value={formData.total_funding_raised}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Round Amount ($) *
                  </label>
                  <input
                    type="number"
                    name="last_round_amount"
                    required
                    value={formData.last_round_amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Round Date *
                  </label>
                  <input
                    type="date"
                    name="last_round_date"
                    required
                    value={formData.last_round_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Previous Investors *
                </label>
                <textarea
                  name="key_previous_investors"
                  required
                  rows={3}
                  value={formData.key_previous_investors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="List your key previous investors..."
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Founders */}
          {step === 4 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Founders</h2>
              {formData.founders.map((founder, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Founder {index + 1}</h3>
                    {formData.founders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFounder(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={founder.name}
                        onChange={(e) => handleFounderChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Educational Qualification *
                      </label>
                      <input
                        type="text"
                        value={founder.educational_qualification}
                        onChange={(e) => handleFounderChange(index, 'educational_qualification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Work Experience *
                      </label>
                      <textarea
                        rows={3}
                        value={founder.previous_work_experience}
                        onChange={(e) => handleFounderChange(index, 'previous_work_experience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile *
                      </label>
                      <input
                        type="url"
                        value={founder.linkedin_profile}
                        onChange={(e) => handleFounderChange(index, 'linkedin_profile', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo URL
                      </label>
                      <input
                        type="text" // Changed from file to text
                        value={founder.photo_url} // Changed from photo_file to photo_url
                        onChange={(e) => handleFounderChange(index, 'photo_url', e.target.value)} // Changed from photo_file to photo_url
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      {founder.photo_url && ( // Changed from photo_file to photo_url
                        <p className="text-xs text-gray-500 mt-1">
                          Photo URL: {founder.photo_url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addFounder}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Founder
              </button>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Revenue Metrics */}
          {step === 4 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Metrics</h2>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Recurring Revenue ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.revenue_metrics.monthly_recurring_revenue}
                      onChange={(e) => handleRevenueMetricsChange('monthly_recurring_revenue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Recurring Revenue ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.revenue_metrics.annual_recurring_revenue}
                      onChange={(e) => handleRevenueMetricsChange('annual_recurring_revenue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revenue Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.revenue_metrics.revenue_growth_rate}
                      onChange={(e) => handleRevenueMetricsChange('revenue_growth_rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Burn Rate ($)
                    </label>
                    <input
                      type="number"
                      value={formData.revenue_metrics.monthly_burn_rate}
                      onChange={(e) => handleRevenueMetricsChange('monthly_burn_rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Cash Runway (months)
                    </label>
                    <input
                      type="number"
                      value={formData.revenue_metrics.current_cash_runway}
                      onChange={(e) => handleRevenueMetricsChange('current_cash_runway', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projected Revenue 12 Months ($)
                    </label>
                    <input
                      type="number"
                      value={formData.revenue_metrics.projected_revenue_12_months}
                      onChange={(e) => handleRevenueMetricsChange('projected_revenue_12_months', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profitability Timeline *
                    </label>
                    <input
                      type="text"
                      value={formData.revenue_metrics.profitability_timeline}
                      onChange={(e) => handleRevenueMetricsChange('profitability_timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., 18 months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Timeline *
                    </label>
                    <input
                      type="text"
                      value={formData.revenue_metrics.investment_timeline}
                      onChange={(e) => handleRevenueMetricsChange('investment_timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="e.g., 3 months"
                    />
                  </div>
                </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Fund Usage & Pitch Deck */}
          {step === 5 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Fund Usage & Pitch Deck</h2>

              {/* Fund Usage */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fund Usage Breakdown</h3>
                <p className="text-sm text-gray-600 mb-4">How will you use the investment funds? (Total must equal 100%)</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Development (%)</label>
                    <input
                      type="number"
                      value={formData.fund_usage.product_development_percentage}
                      onChange={(e) => handleFundUsageChange('product_development_percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marketing (%)</label>
                    <input
                      type="number"
                      value={formData.fund_usage.marketing_percentage}
                      onChange={(e) => handleFundUsageChange('marketing_percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Expansion (%)</label>
                    <input
                      type="number"
                      value={formData.fund_usage.team_expansion_percentage}
                      onChange={(e) => handleFundUsageChange('team_expansion_percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operations (%)</label>
                    <input
                      type="number"
                      value={formData.fund_usage.operations_percentage}
                      onChange={(e) => handleFundUsageChange('operations_percentage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Pitch Deck Upload */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pitch Deck Upload</h3>
                <p className="text-sm text-gray-600 mb-4">Upload your pitch deck (PDF, PPT, or PPTX format)</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch Deck File *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPitchDeckFile(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, PPT, PPTX (Max 10MB)
                  </p>
                </div>

                {pitchDeckFile && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-medium">{pitchDeckFile.name}</p>
                        <p className="text-blue-600 text-sm">{(pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPitchDeckFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center mb-4">{error}</div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StartupProfileCreate;