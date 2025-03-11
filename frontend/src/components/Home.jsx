import React from "react";
import dashboardImage from "../components/Dashboard.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
              Welcome to 
              <span className="text-blue-400 block mt-4">National University</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Empowering students, faculty, and staff with a cutting-edge university management system designed to streamline academic processes, enhance communication, and foster excellence in education.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a
                href="/login"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Login to Portal
              </a>
              <a
                href="/about"
                className="px-8 py-4 border-2 border-blue-600 text-white text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-blue-600/20"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8" data-aos="zoom-in">
              <div className="text-4xl font-bold text-blue-400 mb-4">50+</div>
              <div className="text-gray-300 text-xl">Years of Excellence</div>
            </div>
            <div className="p-8" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-4xl font-bold text-blue-400 mb-4">25K+</div>
              <div className="text-gray-300 text-xl">Students Enrolled</div>
            </div>
            <div className="p-8" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-4xl font-bold text-blue-400 mb-4">95%</div>
              <div className="text-gray-300 text-xl">Graduation Rate</div>
            </div>
          </div>
        </div>
      </section>

            {/* Dashboard Preview */}
            <section className="mt-10 mx-auto max-w-7xl px-4" data-aos="fade-up">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <img 
            src={dashboardImage} 
            alt="University Management System Dashboard" 
            className="rounded-xl border-2 border-white/20"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16" data-aos="fade-up">
            Powerful Features for Modern Education
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🎓',
                title: 'Student Management',
                desc: 'Comprehensive student profiles with academic records, attendance, and personal details.'
              },
              {
                icon: '📅',
                title: 'Course Scheduling',
                desc: 'Efficient course scheduling with conflict detection and room allocation.'
              },
              {
                icon: '📊',
                title: 'Advanced Analytics',
                desc: 'Real-time dashboards and insights for data-driven decision-making.'
              },
              {
                icon: '🔒',
                title: 'Role-based Access',
                desc: 'Secure access control for students, faculty, and administrators.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-xl hover:bg-white/20 transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="text-5xl mb-6 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16" data-aos="fade-up">
            What Our Community Says
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "The university management system has made it so easy to track my academic progress. I love the real-time updates!",
                name: "Sarah Johnson",
                role: "Student"
              },
              {
                text: "As a professor, the course scheduling system has saved me so much time. It's intuitive and efficient.",
                name: "Michael Chen",
                role: "Professor"
              },
              {
                text: "The analytics dashboard is a game-changer. It helps us make data-driven decisions for our programs.",
                name: "Emma Wilson",
                role: "Administrator"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/10 p-8 rounded-xl border border-white/20 hover:border-blue-400/50 transition-all"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <p className="text-lg text-gray-300 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-blue-400">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl" data-aos="zoom-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Join National University?</h2>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
              Experience the future of education with our state-of-the-art university management system.
            </p>
            <div className="flex justify-center gap-6">
              <a
                href="/apply"
                className="px-8 py-4 bg-white text-blue-900 text-lg font-semibold rounded-full transition-all hover:bg-gray-100 hover:scale-105"
              >
                Apply Now
              </a>
              <a
                href="/demo"
                className="px-8 py-4 border-2 border-white text-white text-lg rounded-full hover:bg-white/10 transition-all"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-blue-400">National</span> University
              </div>
              <p className="text-gray-400">Empowering students for a brighter future.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="/admissions" className="text-gray-400 hover:text-white transition">Admissions</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/portal" className="text-gray-400 hover:text-white transition">Student Portal</a></li>
                <li><a href="/faculty-portal" className="text-gray-400 hover:text-white transition">Faculty Portal</a></li>
                <li><a href="/calendar" className="text-gray-400 hover:text-white transition">Academic Calendar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/help" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition">FAQs</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            © 2025 National University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;