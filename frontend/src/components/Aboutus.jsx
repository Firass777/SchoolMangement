import React from "react";
import { FaUsers, FaLightbulb, FaTrophy, FaHandshake, FaChartLine } from "react-icons/fa";
import logo from "../images/logo.jpg"; 

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
              About <span className="text-blue-400">National University</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Empowering students, faculty, and staff with a cutting-edge university management system designed to streamline academic processes, enhance communication, and foster excellence in education.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16" data-aos="fade-up">
            Our Mission
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-300 mb-8">
              At National University, our mission is to provide a transformative educational experience that empowers students to achieve their full potential. We are committed to fostering innovation, inclusivity, and excellence in all aspects of education.
            </p>
            <div className="flex justify-center">
              <FaLightbulb className="text-6xl text-blue-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16" data-aos="fade-up">
            Our History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="University Logo"
                className="rounded-full border-4 border-white/20 w-60 h-60"
              />
            </div>
            <div className="text-xl text-gray-300">
              <p className="mb-6">
                Founded in 1975, National University has grown from a small institution to one of the leading universities in the region. Over the years, we have remained committed to our core values of excellence, integrity, and innovation.
              </p>
              <p className="mb-6">
                Our journey has been marked by numerous milestones, including the introduction of cutting-edge programs, state-of-the-art facilities, and a strong focus on research and development.
              </p>
              <p>
                Today, we continue to build on our legacy by embracing new technologies and methodologies to provide the best possible education for our students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Empty Section */}
      <section className="py-20 bg-white/5 backdrop-blur-lg">

      </section>

      {/* Core Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16" data-aos="fade-up">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUsers className="text-6xl text-blue-400" />,
                title: "Inclusivity",
                desc: "We believe in creating an inclusive environment where everyone feels valued and respected.",
              },
              {
                icon: <FaChartLine className="text-6xl text-blue-400" />,
                title: "Innovation",
                desc: "We embrace innovation to drive academic excellence and prepare students for the future.",
              },
              {
                icon: <FaHandshake className="text-6xl text-blue-400" />,
                title: "Integrity",
                desc: "We uphold the highest standards of integrity in all our actions and decisions.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-xl hover:bg-white/20 transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="flex justify-center mb-6">{value.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-center">{value.title}</h3>
                <p className="text-gray-300 text-center">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16" data-aos="fade-up">
            Our Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaTrophy className="text-6xl text-blue-400" />,
                title: "Top 5 Universities",
                desc: "Ranked among the top 5 universities in the region for academic excellence.",
              },
              {
                icon: <FaUsers className="text-6xl text-blue-400" />,
                title: "5,000+ Students",
                desc: "Over 5,000 students have graduated from our institution.",
              },
              {
                icon: <FaChartLine className="text-6xl text-blue-400" />,
                title: "90% Graduation Rate",
                desc: "One of the highest graduation rates in the country.",
              },
              {
                icon: <FaHandshake className="text-6xl text-blue-400" />,
                title: "Global Partnerships",
                desc: "Collaborations with leading institutions worldwide.",
              },
            ].map((achievement, index) => (
              <div
                key={index}
                className="bg-white/10 p-8 rounded-xl border border-white/20 hover:border-blue-400/50 transition-all"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="flex justify-center mb-6">{achievement.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-center">{achievement.title}</h3>
                <p className="text-gray-300 text-center">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl"
            data-aos="zoom-in"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Join National University Today
            </h2>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
              Experience the future of education with our state-of-the-art university management system.
            </p>
            <div className="flex justify-center gap-6">
              <a
                href="/register"
                className="px-8 py-4 bg-white text-blue-900 text-lg font-semibold rounded-full transition-all hover:bg-gray-100 hover:scale-105"
              >
                Register
              </a>
              <a
                href="/login"
                className="px-8 py-4 border-2 border-white text-white text-lg rounded-full hover:bg-white/10 transition-all"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;