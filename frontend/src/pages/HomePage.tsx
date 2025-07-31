import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Users, TrendingUp, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Founder, TechFlow",
            content: "India Circle connected us with the perfect investors. We raised ₹5Cr in just 3 months!",
            rating: 5
        },
        {
            name: "Rajesh Kumar",
            role: "Angel Investor",
            content: "The platform's matching algorithm is incredible. I found 3 promising startups in my first week.",
            rating: 5
        },
        {
            name: "Anjali Patel",
            role: "CEO, GreenTech Solutions",
            content: "Beyond funding, the mentorship and network access have been game-changing for our growth.",
            rating: 5
        }
    ];

    const features = [
        {
            icon: Target,
            title: "AI-Powered Matching",
            description: "Advanced algorithms match startups with investors based on industry, stage, and investment criteria.",
            gradient: "from-yellow-400 to-orange-500"
        },
        {
            icon: Users,
            title: "Verified Network",
            description: "Connect with verified startups and accredited investors in a trusted ecosystem.",
            gradient: "from-yellow-400 to-amber-500"
        },
        {
            icon: TrendingUp,
            title: "Growth Ecosystem",
            description: "Beyond funding - access mentorship, market insights, and growth opportunities.",
            gradient: "from-yellow-400 to-yellow-600"
        },
        {
            icon: Shield,
            title: "Enterprise Security",
            description: "Bank-level security ensures your sensitive business information stays protected.",
            gradient: "from-yellow-400 to-yellow-500"
        }
    ];

    return (            
        <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-white">
            {/* Hero Section with Animated Background */}
            <main className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative px-6 py-20">
                    <div className="max-w-7xl mx-auto text-center">
                        {/* Premium Badge */}
                        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
                            <Star className="w-4 h-4 fill-yellow-500" />
                            Trusted by 500+ Startups & 200+ Investors
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                Connecting
                            </span>
                            <br />
                            <span className="text-gray-900">Indian Startups with</span>
                            <br />
                            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                Smart Investors
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                            India Circle is the premier platform bridging the gap between innovative startups 
                            and strategic investors across India. Build meaningful partnerships that fuel growth.
                        </p>
                        
                        {/* Enhanced CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                            <button 
                                onClick={() => navigate('/signup')}
                                className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 flex items-center gap-3 text-lg min-w-72 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                            >
                                <span className="relative z-10">Investors Get Started</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                            
                            <button 
                                onClick={() => navigate('/signup')}
                                className="group relative bg-white hover:bg-gray-50 text-gray-900 font-bold px-10 py-5 rounded-2xl transition-all duration-300 flex items-center gap-3 text-lg min-w-72 shadow-2xl hover:shadow-3xl border-2 border-yellow-200 hover:border-yellow-300 transform hover:-translate-y-1"
                            >
                                <span className="relative z-10">Startups Get Started</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Premium Features Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20">
                            {features.map((feature, index) => (
                                <div key={index} className="group relative">
                                    <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                        <div className={`flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                                            <feature.icon className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                                        <p className="text-gray-600 text-center leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Stats Section */}
                        <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-12 shadow-2xl border border-yellow-100 mb-20">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl opacity-50"></div>
                            <div className="relative grid md:grid-cols-3 gap-12 text-center">
                                <div className="group">
                                    <div className="text-5xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">500+</div>
                                    <div className="text-gray-600 text-lg font-medium">Active Startups</div>
                                </div>
                                <div className="group">
                                    <div className="text-5xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">200+</div>
                                    <div className="text-gray-600 text-lg font-medium">Verified Investors</div>
                                </div>
                                <div className="group">
                                    <div className="text-5xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">₹100Cr+</div>
                                    <div className="text-gray-600 text-lg font-medium">Funding Facilitated</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonials Carousel */}
                        <div className="relative max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Our Users Say</h2>
                            
                            <div className="relative overflow-hidden rounded-3xl">
                                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    {testimonials.map((testimonial, index) => (
                                        <div key={index} className="w-full flex-shrink-0 px-8">
                                            <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
                                                <div className="flex justify-center mb-6">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                                                    ))}
                                                </div>
                                                <p className="text-xl text-gray-700 mb-8 text-center italic leading-relaxed">
                                                    "{testimonial.content}"
                                                </p>
                                                <div className="text-center">
                                                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                                                    <div className="text-gray-600">{testimonial.role}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Carousel Navigation */}
                                <button 
                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                                </button>
                                <button 
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <ChevronRight className="w-6 h-6 text-gray-600" />
                                </button>
                                
                                {/* Dots */}
                                <div className="flex justify-center mt-6 space-x-2">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${
                                                index === currentSlide ? 'bg-yellow-500' : 'bg-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;