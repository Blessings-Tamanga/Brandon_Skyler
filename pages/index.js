import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [releases, setReleases] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      setTheme('light');
    }

    // Fetch releases data
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const response = await fetch('/api/musicReleases');
      const data = await response.json();
      // Only set if data is an array; ignore errors or non-array responses
      if (Array.isArray(data)) {
        setReleases(data);
      } else {
        console.warn('API returned non-array response:', data);
      }
    } catch (err) {
      console.error('Failed to load releases:', err);
    }
  };

  const toggleTheme = () => {
    const isLight = theme === 'light';
    if (isLight) {
      document.body.classList.remove('light-mode');
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.elements['fullName'].value,
      email: form.elements['email'].value,
      subject: form.elements['subject'].value,
      message: form.elements['message'].value,
      timestamp: Date.now()
    };
    try {
      const response = await fetch('/api/contactMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert('Thank you for your message. We will respond within 24 hours.');
        form.reset();
      }
    } catch (err) {
      console.error(err);
      alert('There was a problem submitting your message. Please try again later.');
    }
  };

  return (
    <>
      <Head>
        <title>Brandon Skyler — Musical Artist & Actor</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link rel="stylesheet" href="/css.css" />
      </Head>

      <>
        {/* HEADER/NAVBAR */}
        <header>
          <nav>
            <a href="/" className="logo">Brandon Skyler</a>
            <ul className={`nav-menu ${navOpen ? 'active' : ''}`} id="navMenu">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#music">Music</a></li>
              <li><a href="#acting">Acting</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#team">Team</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button></li>
            </ul>
            <button 
              className="hamburger" 
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation" 
              aria-expanded={navOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section id="home" className="hero">
          <div className="hero-content">
            <p className="hero-subtitle">Musical Artist & Actor & Songwriter</p>
            <h1>Brandon Skyler</h1>
            <p>Award-winning musician and versatile actor delivering powerful performances across film, television, and live stage. Blending African rhythms with sophisticated contemporary production, creating authentic artistry with global resonance.</p>
            <div className="hero-buttons">
              <a href="#music" className="btn btn-primary">Listen Now</a>
              <a href="#contact" className="btn btn-secondary">Book Me</a>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="light-section">
          <div className="section-container">
            <h2>About Brandon Skyler</h2>
            <div className="about-content">
              <div className="about-text">
                <h3>Artist Biography</h3>
                <div className="about-image">
                  <img src="/Media/clear.png" alt="Brandon Skyler" />
                </div>
                <div>
                  <p>Brandon Tyler Feakins (born June 26, 1990), known professionally as Brandon Skyler, is an accomplished American actor recognized for his compelling roles in acclaimed films including Mapplethorpe, Vice (both 2018), Midway (2019), It Ends with Us (2024), Drop and The Housemaid (both 2025). In television, he gained prominence through his role as Spencer Dutton in the acclaimed series 1923.</p>
                  <p>A Malawi-born singer-songwriter, Brandon crafts sophisticated musical compositions that seamlessly blend African rhythms with modern production. His artistic influences—ranging from icons like Michael Jackson and Dolly Parton to Mariah Carey—inform his distinctive approach to both music and acting.</p>
                  <p><strong>Selected influences:</strong> Hannah Montana, Michael Jackson, Dolly Parton, Mariah Carey.</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-number">200+</span>
                  <div className="stat-label">Original Compositions</div>
                </div>
                <div className="stat-box">
                  <span className="stat-number">15+</span>
                  <div className="stat-label">Film & TV Roles</div>
                </div>
                <div className="stat-box">
                  <span className="stat-number">50M+</span>
                  <div className="stat-label">Total Streams</div>
                </div>
                <div className="stat-box">
                  <span className="stat-number">Live</span>
                  <div className="stat-label">Global Performances</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MUSIC SECTION */}
        <section id="music" className="dark-section">
          <div className="section-container">
            <h2>Latest Releases</h2>
            <p className="section-subtitle">Experience the refined artistry and sophisticated production of Brandon's recent musical creations</p>
            <div className="releases-grid" id="releasesGrid">
              {releases.map((release, index) => (
                <div key={index} className="release-card">
                  <div className="release-image"><i className={`fas ${release.cover}`}></i></div>
                  <div className="release-info">
                    <div className="release-year">{release.year}</div>
                    <h3 className="release-title">{release.title}</h3>
                    <p className="release-type">{release.type}</p>
                    <a href="#" className="btn btn-primary">Listen Now</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all">
              <a href="#" className="btn btn-secondary">View All Releases</a>
            </div>
          </div>
        </section>

        {/* ACTING SECTION */}
        <section id="acting" className="light-section">
          <div className="section-container">
            <h2>Acting & Film</h2>
            <p className="section-subtitle">Notable performances across theatre, film, and television</p>
            <div className="acting-grid">
              <div className="acting-card">
                <h3>Theatre Production</h3>
                <p>Lead role in a critically-acclaimed stage drama, demonstrating exceptional range and emotional depth in live performance.</p>
                <div className="video-container">
                  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowFullScreen=""></iframe>
                </div>
                <a href="#" className="btn btn-primary">View Details</a>
              </div>

              <div className="acting-card">
                <h3>Film Project 2024</h3>
                <p>Supporting role in a feature film project, bringing nuanced character work and professional excellence to every scene.</p>
                <div className="video-container">
                  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowFullScreen=""></iframe>
                </div>
                <a href="#" className="btn btn-primary">View Details</a>
              </div>

              <div className="acting-card">
                <h3>1923 Television Series</h3>
                <p>Recurring role as Spencer Dutton in the acclaimed period series, garnering critical praise for authentic character portrayal.</p>
                <div className="video-container">
                  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowFullScreen=""></iframe>
                </div>
                <a href="#" className="btn btn-primary">View Details</a>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section id="gallery" className="dark-section">
          <div className="section-container">
            <h2>Gallery</h2>
            <p className="section-subtitle">Visual documentation of performances, studio sessions, and behind-the-scenes moments</p>
            <div className="gallery-grid">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="gallery-item">
                  <div className="gallery-image">
                    <img src="/Media/clear.png" alt={`Gallery ${index + 1}`} />
                    <i className="fas fa-search-plus gallery-zoom-icon"></i>
                  </div>
                  <div className="gallery-overlay">
                    <div className="gallery-title">Featured Item</div>
                    <div className="gallery-category">Professional Portfolio</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all">
              <a href="#" className="btn btn-secondary">View More Photos</a>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section id="team" className="light-section">
          <div className="section-container">
            <h2>Meet The Team</h2>
            <p className="section-subtitle">Exceptional professionals dedicated to advancing Brandon's artistic vision and brand excellence</p>
            <div className="team-grid">
              <div className="team-card">
                <div className="team-image">
                  <img src="/Media/clear.png" alt="Brandon Skyler" />
                </div>
                <h3>Brandon Skyler</h3>
                <p className="team-role">Lead Artist & Creative Director</p>
                <p className="team-bio">Accomplished musician, actor, and songwriter with over 200 original compositions. Specializes in sophisticated fusion of African rhythms with contemporary production.</p>
                <div className="team-skills">
                  <span className="skill-tag">Songwriting</span>
                  <span className="skill-tag">Acting</span>
                  <span className="skill-tag">Vocals</span>
                </div>
              </div>
            </div>
            <div className="view-all">
              <a href="#" className="btn btn-primary">Join Our Team</a>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="dark-section">
          <div className="section-container">
            <h2>Get In Touch</h2>
            <p className="section-subtitle">Professional inquiries for bookings, collaborations, or media relations</p>
            <div className="contact-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" required />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select name="subject" required>
                    <option value="">Select Subject</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="collaboration">Collaboration Proposal</option>
                    <option value="press">Press Inquiry</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows="5" name="message" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>

              <div className="contact-info">
                <div>
                  <h3>Email</h3>
                  <a href="mailto:hello@brandonsklenar.com">hello@brandonsklenar.com</a>
                </div>
                <div>
                  <h3>Location</h3>
                  <p>United States</p>
                </div>
                <div>
                  <h3>Phone</h3>
                  <a href="tel:+1234567890">+1 (234) 567-8900</a>
                </div>
                <div>
                  <h3>Follow</h3>
                  <div className="social-links">
                    <a href="#" className="social-link" title="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href="#" className="social-link" title="YouTube"><i className="fab fa-youtube"></i></a>
                    <a href="#" className="social-link" title="Spotify"><i className="fab fa-spotify"></i></a>
                    <a href="#" className="social-link" title="Twitter"><i className="fab fa-twitter"></i></a>
                  </div>
                </div>

                <div className="newsletter">
                  <h4>Newsletter</h4>
                  <p>Subscribe for exclusive updates, new releases, and upcoming performance announcements</p>
                  <div className="newsletter-form">
                    <input type="email" placeholder="Enter your email" required />
                    <button type="submit" className="btn btn-primary">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h4>Brandon Skyler</h4>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '0.3px'}}>Musical Artist • Actor • Songwriter</p>
            </div>
            <div className="footer-section">
              <h4>Navigation</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#music">Music</a></li>
                <li><a href="#gallery">Gallery</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Music</h4>
              <ul>
                <li><a href="#">Latest Release</a></li>
                <li><a href="#">Discography</a></li>
                <li><a href="#">Tour Dates</a></li>
                <li><a href="#">Press Kit</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Brandon Skyler. All rights reserved.</p>
          </div>
        </footer>
      </>
    </>
  );
}
