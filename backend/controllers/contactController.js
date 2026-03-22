// Contact Form Controller for ImagineAI

const Contact = require('../models/Contact');
const { sendContactConfirmation, sendContactNotificationToAdmin } = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { name, email, eventDate, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Create contact submission
        const contact = await Contact.create({
            name,
            email,
            eventDate: eventDate || null,
            message,
            status: 'pending'
        });

        // Send emails (non-blocking — don't hold up the response)
        sendContactConfirmation({ name, email }).catch(() => {});
        sendContactNotificationToAdmin({ name, email, eventDate, message }).catch(() => {});

        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you within 24 hours.',
            data: {
                id: contact._id,
                submittedAt: contact.createdAt
            }
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again later.'
        });
    }
};

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact/all
// @access  Private/Admin
const getAllContactSubmissions = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            data: {
                contacts,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error('Get contact submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact submissions'
        });
    }
};

// @desc    Update contact submission status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['pending', 'responded', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, responded, or resolved'
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status'
        });
    }
};

module.exports = {
    submitContactForm,
    getAllContactSubmissions,
    updateContactStatus
};
