// src/pages/service.js — ONLY file in pages/ allowed to touch Contact model
const Contact = require('./contact.model');

exports.createContact = (data) => Contact.create(data);
exports.listContacts = (filter = {}) => Contact.find(filter).sort({ createdAt: -1 });

exports._model = Contact;
