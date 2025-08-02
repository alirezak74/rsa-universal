import Layout from '@/components/Layout'

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Get in touch with the RSA Chain team. We're here to help with questions, 
          support, and collaboration opportunities.
        </p>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Project Information</h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <span className="mr-3">👨‍💻</span>
                  <span><strong>Project Founder:</strong> Ali Kabiri</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">🌐</span>
                  <span><strong>Website:</strong> rsacrypto.com</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">📧</span>
                  <span><strong>Email:</strong> info@rsacrypto.com</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-3">🏢</span>
                  <span><strong>Organization:</strong> RSA Crypt</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a 
                  href="https://github.com/rsacrypt/rsachane" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <span className="mr-3">📚</span>
                  <span>GitHub Repository</span>
                </a>
                <a 
                  href="https://github.com/rsacrypt/rsachane/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <span className="mr-3">🐛</span>
                  <span>Report Issues</span>
                </a>
                <a 
                  href="http://localhost:4000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <span className="mr-3">🔍</span>
                  <span>Blockchain Explorer</span>
                </a>
                <a 
                  href="http://localhost:3001" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <span className="mr-3">💼</span>
                  <span>Web Wallet</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Send us a Message</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Community */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Join Our Community</h2>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white text-center">
            <h3 className="text-2xl font-semibold mb-4">Stay Connected</h3>
            <p className="text-lg mb-6 opacity-90">
              Follow us for updates, announcements, and community discussions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://github.com/rsacrypt/rsachane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://github.com/rsacrypt/rsachane/discussions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Discussions
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 