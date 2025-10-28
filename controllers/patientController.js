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

  // GET /patients/me
  me: async (req, res) => {
    try {
      const temp = req.user;
      const userId = req.user.userId;
      if (!userId) return errorResponse(res, "Unauthorized", 401);

      const patient =
        (await Patient.findByUserId?.(userId)) ||
        (await Patient.findById(req.user?.patient_id)); // fallback if model lacks findByUserId

      if (!patient) return notFoundError(res, "Patient");
      return successResponse(res, patient);
    } catch (error) {
      return errorResponse(res, "Failed to fetch profile");
    }
  },

  // PUT /patients/me
  updateMe: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return errorResponse(res, "Unauthorized", 401);

      const patient =
        (await Patient.findByUserId?.(userId)) ||
        (await Patient.findById(req.user?.patient_id));

      if (!patient) return notFoundError(res, "Patient");

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

      const updated = await Patient.update(patient.id, updateData);
      if (!updated) return errorResponse(res, "Failed to update profile");

      const fresh = await Patient.findById(patient.id);
      return successResponse(res, fresh, "Profile updated");
    } catch (error) {
      return errorResponse(res, "Failed to update profile");
    }
  },

  create: async (req, res) => {
    try {
      const {
        user_id,
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
        ...(norm(user_id) !== null && { user_id: norm(user_id) }),
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
        user_id,
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
