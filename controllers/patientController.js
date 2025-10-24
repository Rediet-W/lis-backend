const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient");
const {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} = require("../utils/responseUtils");
const {
  validateRequiredFields,
  validateEmail,
  validatePhone,
} = require("../utils/validationUtils");

const patientController = {
  login: async (req, res) => {
    try {
      const { email, card_number, identifier, password } = req.body || {};
      const idf = identifier || email || card_number;
      if (!idf || !password) {
        return validationError(res, [
          "identifier/email/card_number and password are required",
        ]);
      }

      let patient = null;
      if (email || (idf && String(idf).includes("@"))) {
        patient = await Patient.findByEmail(email || idf);
      } else {
        patient = await Patient.findByCardNumber(card_number || idf);
      }
      if (!patient || !patient.password) {
        return errorResponse(res, "Invalid credentials", 401);
      }

      const ok = await bcrypt.compare(password, patient.password);
      if (!ok) {
        return errorResponse(res, "Invalid credentials", 401);
      }

      const token = signPatientToken(patient);
      return successResponse(
        res,
        { token, patient: sanitizePatient(patient) },
        "Login successful"
      );
    } catch (err) {
      return errorResponse(res, "Failed to login");
    }
  },

  // GET /patients/me
  me: async (req, res) => {
    try {
      const id = req.user?.id;
      if (!id) return errorResponse(res, "Unauthorized", 401);
      const patient = await Patient.findById(id);
      if (!patient) return notFoundError(res, "Patient");
      return successResponse(res, sanitizePatient(patient));
    } catch {
      return errorResponse(res, "Failed to load profile");
    }
  },

  // PUT /patients/me
  updateMe: async (req, res) => {
    try {
      const id = req.user?.id;
      if (!id) return errorResponse(res, "Unauthorized", 401);

      // Allow only table columns
      const {
        card_number,
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
        password,
      } = req.body || {};

      const norm = (v) => (v === "" || v === undefined ? null : v);
      const updateData = {};
      if (card_number !== undefined) updateData.card_number = norm(card_number);
      if (full_name !== undefined)
        updateData.full_name = full_name?.trim() || null;
      if (date_of_birth !== undefined)
        updateData.date_of_birth = norm(date_of_birth);
      if (gender !== undefined) updateData.gender = norm(gender);
      if (phone !== undefined) updateData.phone = norm(phone);
      if (address !== undefined) updateData.address = norm(address);
      if (emergency_contact !== undefined)
        updateData.emergency_contact = norm(emergency_contact);
      if (email !== undefined) updateData.email = norm(email);
      if (blood_type !== undefined)
        updateData.blood_type = norm(blood_type) || "unknown";
      if (known_allergies !== undefined)
        updateData.known_allergies = norm(known_allergies);
      if (chronic_conditions !== undefined)
        updateData.chronic_conditions = norm(chronic_conditions);
      if (current_medications !== undefined)
        updateData.current_medications = norm(current_medications);

      if (password !== undefined && password !== null) {
        updateData.password = await bcrypt.hash(String(password), 10);
      }

      const ok = await Patient.update(id, updateData);
      if (!ok) return errorResponse(res, "Failed to update profile");
      return successResponse(res, { id, ...updateData }, "Profile updated");
    } catch {
      return errorResponse(res, "Failed to update profile");
    }
  },
  getAll: async (req, res) => {
    try {
      const patients = await Patient.findAll();
      successResponse(res, patients);
    } catch (error) {
      errorResponse(res, "Failed to fetch patients");
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const patient = await Patient.findById(id);

      if (!patient) {
        return notFoundError(res, "Patient");
      }

      const visits = await Patient.getVisits(id);
      successResponse(res, { ...patient, visits });
    } catch (error) {
      errorResponse(res, "Failed to fetch patient");
    }
  },

  create: async (req, res) => {
    try {
      const {
        card_number,
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
        password,
      } = req.body;

      const errors = validateRequiredFields({ full_name, gender }, [
        "full_name",
        "gender",
      ]);
      if (errors.length > 0) {
        return validationError(res, errors);
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        return validationError(res, ["Invalid email format"]);
      }

      // Validate phone if provided
      if (phone && !validatePhone(phone)) {
        return validationError(res, ["Invalid phone number format"]);
      }

      const norm = (v) => (v === "" || v === undefined ? null : v);

      const patientData = {
        ...(norm(card_number) !== null && { card_number: norm(card_number) }),
        full_name: full_name.trim(),
        ...(norm(date_of_birth) !== null && {
          date_of_birth: norm(date_of_birth),
        }),
        gender: gender,
        ...(norm(phone) !== null && { phone: norm(phone) }),
        ...(norm(address) !== null && { address: norm(address) }),
        ...(norm(emergency_contact) !== null && {
          emergency_contact: norm(emergency_contact),
        }),
        ...(norm(email) !== null && { email: norm(email) }),
        blood_type: norm(blood_type) || "unknown",
        ...(norm(known_allergies) !== null && {
          known_allergies: norm(known_allergies),
        }),
        ...(norm(chronic_conditions) !== null && {
          chronic_conditions: norm(chronic_conditions),
        }),
        ...(norm(current_medications) !== null && {
          current_medications: norm(current_medications),
        }),
      };

      // Check if card number already exists
      if (card_number) {
        const existingPatient = await Patient.findByCardNumber(card_number);
        if (existingPatient) {
          return errorResponse(
            res,
            "Patient with this card number already exists",
            409
          );
        }
      }
      if (password) {
        patientData.password = await bcrypt.hash(String(password), 10);
      }

      const newPatient = await Patient.create(patientData);
      successResponse(res, newPatient, "Patient created successfully", 201);
    } catch (error) {
      errorResponse(res, "Failed to create patient");
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        card_number,
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type,
        known_allergies,
        chronic_conditions,
        current_medications,
        password,
      } = req.body;

      const existingPatient = await Patient.findById(id);
      if (!existingPatient) {
        return notFoundError(res, "Patient");
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        return validationError(res, ["Invalid email format"]);
      }

      // Validate phone if provided
      if (phone && !validatePhone(phone)) {
        return validationError(res, ["Invalid phone number format"]);
      }

      const norm = (v) => (v === "" || v === undefined ? null : v);

      const updateData = {};
      if (card_number !== undefined) updateData.card_number = norm(card_number);
      if (full_name !== undefined)
        updateData.full_name = full_name?.trim() || null;
      if (date_of_birth !== undefined)
        updateData.date_of_birth = norm(date_of_birth);
      if (gender !== undefined) updateData.gender = norm(gender);
      if (phone !== undefined) updateData.phone = norm(phone);
      if (address !== undefined) updateData.address = norm(address);
      if (emergency_contact !== undefined)
        updateData.emergency_contact = norm(emergency_contact);
      if (email !== undefined) updateData.email = norm(email);
      if (blood_type !== undefined)
        updateData.blood_type = norm(blood_type) || "unknown";
      if (known_allergies !== undefined)
        updateData.known_allergies = norm(known_allergies);
      if (chronic_conditions !== undefined)
        updateData.chronic_conditions = norm(chronic_conditions);
      if (current_medications !== undefined)
        updateData.current_medications = norm(current_medications);
      if (password !== undefined && password !== null) {
        updateData.password = await bcrypt.hash(String(password), 10);
      }

      // Check if new card number conflicts with existing patient
      if (card_number && card_number !== existingPatient.card_number) {
        const patientWithCard = await Patient.findByCardNumber(card_number);
        if (patientWithCard && patientWithCard.id !== parseInt(id)) {
          return errorResponse(
            res,
            "Another patient with this card number already exists",
            409
          );
        }
      }

      const updated = await Patient.update(id, updateData);

      if (updated) {
        successResponse(
          res,
          { id, ...updateData },
          "Patient updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update patient");
      }
    } catch (error) {
      errorResponse(res, "Failed to update patient");
    }
  },

  search: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return errorResponse(
          res,
          "Search query must be at least 2 characters long",
          400
        );
      }

      const patients = await Patient.search(q);
      successResponse(res, patients);
    } catch (error) {
      errorResponse(res, "Failed to search patients");
    }
  },
};

module.exports = patientController;
