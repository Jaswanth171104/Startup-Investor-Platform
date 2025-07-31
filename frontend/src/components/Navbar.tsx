import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Sparkles } from 'lucide-react';
import { isAuthenticated, logout, getUserRole } from '../utils/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const userRole = getUserRole();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!authenticated) return '/login';
    return userRole === 'startup' ? '/startup-dashboard' : '/investor-dashboard';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-2xl border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-center space-x-3 text-gray-900 hover:text-yellow-600 transition-all duration-300">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  India Circle
                </span>
                <div className="text-xs text-gray-500 -mt-1">Startup Ecosystem</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {authenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="group relative text-gray-700 hover:text-yellow-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-yellow-50"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-yellow-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <User className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {userRole}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="group flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-yellow-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-yellow-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 mt-4 p-6 animate-slideDown">
            {authenticated ? (
              <div className="space-y-4">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-yellow-600 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-yellow-50"
                >
                  Dashboard
                </Link>
                
                <div className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <User className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {userRole}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-yellow-600 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:bg-yellow-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 