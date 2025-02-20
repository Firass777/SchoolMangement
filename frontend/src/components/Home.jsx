const Home = () => {
    return (
      <section className="text-center text-white py-20" data-aos="fade-up">
        <div className="container mx-auto">
          {/* Hero Section */}
          <h1 className="text-4xl font-extrabold mb-6 animate__animated animate__fadeIn">
            Welcome to SchoolManager
          </h1>
          <p className="text-xl mb-12 animate__animated animate__fadeIn">
            Manage your school resources with ease. Track attendance, grades, and more.
          </p>
  
          {/* Call to Action */}
          <div className="flex justify-center mb-12">
            <a
              href="/register"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-full transition duration-300"
              data-aos="zoom-in"
            >
              Get Started
            </a>
          </div>
  
          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div
              className="bg-white text-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              data-aos="fade-up"
            >
              <h3 className="text-2xl font-semibold mb-4">Attendance Tracking</h3>
              <p>Efficiently track student attendance and generate reports.</p>
            </div>
  
            <div
              className="bg-white text-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              data-aos="fade-up"
            >
              <h3 className="text-2xl font-semibold mb-4">Grade Management</h3>
              <p>Manage student grades and monitor progress over time.</p>
            </div>
  
            <div
              className="bg-white text-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              data-aos="fade-up"
            >
              <h3 className="text-2xl font-semibold mb-4">Reports & Insights</h3>
              <p>Generate detailed reports to analyze student performance.</p>
            </div>
          </div>
  
          {/* Testimonials Section */}
          <div className="my-24">
            <h2 className="text-3xl font-extrabold text-gray-300 mb-6">What Our Users Say</h2>
            <div className="flex flex-wrap justify-center gap-10">
              <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg max-w-xs">
                <p className="text-lg mb-4">"SchoolManager has transformed the way we track attendance and grades. It’s easy to use and very reliable!"</p>
                <p className="font-semibold">John Doe</p>
                <p>Principal</p>
              </div>
              <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg max-w-xs">
                <p className="text-lg mb-4">"As a teacher, SchoolManager has made my job easier. It’s simple and helps me stay organized!"</p>
                <p className="font-semibold">Jane Smith</p>
                <p>Teacher</p>
              </div>
            </div>
          </div>
  
          {/* Contact Section */}
          <div className="py-20 bg-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">Get In Touch</h2>
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">Have questions? We’d love to hear from you. Reach out to us via the contact form below.</p>
              <a
                href="mailto:contact@schoolmanager.com"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-full"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default Home;
  