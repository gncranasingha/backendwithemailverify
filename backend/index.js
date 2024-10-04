require('dotenv').config();
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const FormData = require('./models/FormData');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to avoid duplicate file names
  }
});
const upload = multer({ storage });

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: "chanakanipun10@gmail.com", // Your email
    pass: "relw eyex nlkw ohnq", // Your email app-specific password
  },
  tls: {
    rejectUnauthorized: false
  },
});

// Route to handle form submission and email sending
app.post('/api/submit', upload.single('media'), async (req, res) => {
  try {
    console.log('Form Data:', req.body);
    console.log('Uploaded File:', req.file);

    const { name, email, message } = req.body;
    const media = req.file.path;

    // Validate form inputs
    if (!name || !email || !message || !media) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    // Save form data to MongoDB
    const newFormData = new FormData({ name, email, message, media });
    await newFormData.save();

    // Prepare email options with file attachment
    const mailOptions = {
      from: {
        name: 'Nipun',
        address: 'chanakanipun10@gmail.com'
      },
      to: email,
      subject: "Welcome to my System",
      text: `Hello ${name},\n\nThank you for your message: "${message}".\n\nYour file has been received and attached below.`,
      attachments: [
        {
          filename: req.file.originalname, // File name for the attachment
          path: media // File path of the uploaded file
        }
      ]
    };

    // Send email with the attachment
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Form submitted and email sent successfully with attachment!' });
      }
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
