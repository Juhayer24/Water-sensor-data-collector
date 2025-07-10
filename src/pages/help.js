// Import necessary modules and CSS
import React, { useState } from 'react';
import '../styles/help.css';

// Predefined list of frequently asked questions and their answers
const faqs = [
	{
		question: 'How do I start using the software?',
		answer:
			'First, make sure both the backend and frontend are running. Then open your browser and go to http://localhost:3000. Log in or sign up to begin.',
	},
	{
		question: 'What should I do if the camera is not working?',
		answer:
			'Check that the Raspberry Pi is powered on and connected to the network. Make sure the backend server is running. Try restarting the backend if needed.',
	},
	{
		question: 'How do I reset my password?',
		answer:
			'On the login page, click the “Forgot password?” link and follow the instructions to reset your password.',
	},
	{
		question: 'How do I stop the image capture process?',
		answer:
			'Go to the Run page and press the Stop button. This will stop the image capture process on the backend.',
	},
	{
		question: 'Who do I contact for help?',
		answer:
			'If you have any issues, please contact your project lead or a more experienced engineer.',
	},
];

// Help component renders the FAQ section
function Help() {
	// Tracks which FAQ item is currently open (expanded)
	const [openIndex, setOpenIndex] = useState(null);
	// Controls visibility of the hamburger menu
	const [menuOpen, setMenuOpen] = useState(false);

	// Function to handle user logout by clearing user info and redirecting
	const handleLogout = () => {
		localStorage.removeItem('currentUser'); // Remove user session from local storage
		window.location.href = '/login'; // Redirect to login page
	};

	return (
		<div>
			{/* Navigation Bar */}
			<nav style={{ position: 'relative' }}>
				{/* Hamburger menu toggle button */}
				<button
					className="nav-hamburger"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Menu"
				>
					&#9776;
				</button>

				{/* Dropdown menu shown when hamburger is active */}
				{menuOpen && (
					<div className="nav-dropdown">
						<button onClick={handleLogout}>Logout</button>
						<a href="/help" className="nav-dropdown-link">
							Help
						</a>
					</div>
				)}

				{/* Center navigation link to homepage */}
				<div className="nav-center">
					<a href="/home">Home</a>
				</div>
			</nav>

			{/* Help section content */}
			<div className="help-container">
				<h2 className="help-title">Help & Frequently Asked Questions</h2>

				{/* Render all FAQ questions and toggle answers on click */}
				<div className="faq-list">
					{faqs.map((faq, idx) => (
						<div className="faq-item" key={idx}>
							{/* Question toggle button */}
							<button
								className={`faq-question${
									openIndex === idx ? ' open' : ''
								}`}
								onClick={() =>
									setOpenIndex(openIndex === idx ? null : idx)
								}
							>
								{faq.question}
								{/* Show up/down arrow depending on state */}
								<span className="faq-arrow">
									{openIndex === idx ? '▲' : '▼'}
								</span>
							</button>

							{/* Show answer if the current index is open */}
							<div
								className={`faq-answer${
									openIndex === idx ? ' show' : ''
								}`}
							>
								{faq.answer}
							</div>
						</div>
					))}
				</div>

				{/* Footer note */}
				<div className="help-footer">
					For more information, please refer to the README or contact
					support.
				</div>
			</div>
		</div>
	);
}

export default Help;
