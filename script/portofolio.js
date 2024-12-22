document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.querySelector('.contact-form');
    const nameInput = form.querySelector('input[placeholder="Your Name"]');
    const phoneInput = form.querySelector('input[placeholder="Your Phone Number"]');
    const emailInput = form.querySelector('input[placeholder="Your Email Address"]');
    const subjectInput = form.querySelector('input[placeholder="Enter Subject"]');
    const messageInput = form.querySelector('textarea');
    const submitBtn = form.querySelector('.submit-btn a');

    // Add EmailJS SDK
    const emailJsScript = document.createElement('script');
    emailJsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    document.head.appendChild(emailJsScript);

    emailJsScript.onload = function() {
        // Initialize EmailJS with the service
        emailjs.init("service_b7sixu6");
    };

    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
        .input-control input:focus,
        .input-control textarea:focus {
            border-color: #04a869;
            box-shadow: 0 0 5px rgba(4, 168, 105, 0.3);
            outline: none;
        }

        .error-message {
            color: #ff3333;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            padding: 0.5rem;
            border-radius: 4px;
            background-color: rgba(255, 51, 51, 0.1);
            transition: all 0.3s ease;
            transform-origin: left;
            animation: slideIn 0.3s ease;
        }

        .success-message {
            color: #04a869;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            padding: 0.5rem;
            border-radius: 4px;
            background-color: rgba(4, 168, 105, 0.1);
            transition: all 0.3s ease;
        }

        .input-control input.error,
        .input-control textarea.error {
            border: 2px solid #ff3333;
            background-color: rgba(255, 51, 51, 0.05);
        }

        .input-control input.success,
        .input-control textarea.success {
            border: 2px solid #04a869;
            background-color: rgba(4, 168, 105, 0.05);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .shake {
            animation: shake 0.5s ease-in-out;
        }

        .submit-btn {
            position: relative;
            overflow: hidden;
        }

        .submit-feedback {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .submit-feedback.success {
            background-color: #04a869;
            transform: translateY(0);
        }

        .submit-feedback.error {
            background-color: #ff3333;
            transform: translateY(0);
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // Show error with animation
    const showError = (input, message) => {
        const formControl = input.parentElement;
        let errorDiv = formControl.querySelector('.error-message');
        
        input.classList.remove('success');
        input.classList.add('error', 'shake');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formControl.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    };

    // Show success with animation
    const showSuccess = (input) => {
        const formControl = input.parentElement;
        const errorDiv = formControl.querySelector('.error-message');
        if (errorDiv) {
            formControl.removeChild(errorDiv);
        }
        
        input.classList.remove('error');
        input.classList.add('success');
    };

    // Show feedback message
    const showFeedback = (message, type) => {
        const existing = document.querySelector('.submit-feedback');
        if (existing) {
            existing.remove();
        }

        const feedback = document.createElement('div');
        feedback.className = `submit-feedback ${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                feedback.remove();
            }, 300);
        }, 3000);
    };

    // Validate email format
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    // Validate phone number (Israeli format)
    const validatePhone = (phone) => {
        const phoneRegex = /^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    };

    // Check required fields
    const checkRequired = (inputArray) => {
        let isValid = true;
        inputArray.forEach((input) => {
            if (input.value.trim() === '') {
                showError(input, `${input.placeholder} is required`);
                isValid = false;
            } else {
                showSuccess(input);
            }
        });
        return isValid;
    };

    // Check input length
    const checkLength = (input, min, max) => {
        const length = input.value.trim().length;
        if (length < min) {
            showError(input, `${input.placeholder} must be at least ${min} characters`);
            return false;
        } else if (length > max) {
            showError(input, `${input.placeholder} must be less than ${max} characters`);
            return false;
        }
        showSuccess(input);
        return true;
    };

    // Real-time validation
    const inputs = [nameInput, phoneInput, emailInput, subjectInput, messageInput];
    inputs.forEach(input => {
        input.style.transition = 'all 0.3s ease';
        
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                if (input === emailInput) {
                    validateEmail(input.value) ? showSuccess(input) : showError(input, 'Please enter a valid email address');
                } else if (input === phoneInput) {
                    validatePhone(input.value) ? showSuccess(input) : showError(input, 'Please enter a valid phone number');
                }
            }
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                showError(input, `${input.placeholder} is required`);
            } else {
                if (input === emailInput && !validateEmail(input.value)) {
                    showError(input, 'Please enter a valid email address');
                } else if (input === phoneInput && !validatePhone(input.value)) {
                    showError(input, 'Please enter a valid phone number');
                } else if (input === nameInput && !checkLength(input, 2, 50)) {
                    showError(input, 'Name must be between 2 and 50 characters');
                } else if (input === messageInput && !checkLength(input, 10, 500)) {
                    showError(input, 'Message must be between 10 and 500 characters');
                } else {
                    showSuccess(input);
                }
            }
        });
    });

    // Form submission with EmailJS
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!checkRequired(inputs)) {
            showFeedback('Please fill in all required fields', 'error');
            return;
        }

        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            return;
        }

        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid phone number');
            return;
        }

        if (!checkLength(nameInput, 2, 50)) return;
        if (!checkLength(messageInput, 10, 500)) return;

        // Show loading state
        submitBtn.classList.add('loading');
        const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'Sending...';

        try {
            await emailjs.send('service_b7sixu6', 'template_contact', {
                from_name: nameInput.value,
                phone_number: phoneInput.value,
                reply_to: emailInput.value,
                subject: subjectInput.value,
                message: messageInput.value
            });

            showFeedback('Message sent successfully!', 'success');
            form.reset();
            inputs.forEach(input => {
                input.classList.remove('success', 'error');
                input.style.border = '';
                input.style.backgroundColor = '';
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            showFeedback('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-text').textContent = originalBtnText;
        }
    });
});