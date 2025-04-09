import React, { useState } from "react";
import axios from "axios";

const GetInTouchForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, message } = formData;
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!message) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/contact", formData);
      if (response.data.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 3000); // Close the form after 3 seconds
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrors({ submit: "Failed to send message. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="get-in-touch-form-overlay show" onClick={onClose}>
      <div
        className="get-in-touch-form-container show"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Get in Touch</h2>
        {isSubmitted ? (
          <p>Thank you! Your message has been sent.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              {errors.message && (
                <p className="error-message">{errors.message}</p>
              )}
            </div>
            {errors.submit && <p className="error-message">{errors.submit}</p>}
            <button
              type="submit"
              className="sendmessage"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Your Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GetInTouchForm;
