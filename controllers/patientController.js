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
      } = req.body;

      const errors = validateRequiredFields(
        { full_name, date_of_birth, gender },
        ["full_name", "date_of_birth", "gender"]
      );
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

      const patientData = {
        card_number,
        full_name,
        date_of_birth,
        gender,
        phone,
        address,
        emergency_contact,
        email,
        blood_type: blood_type || "unknown",
        known_allergies,
        chronic_conditions,
        current_medications,
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

      const updateData = {};
      if (card_number !== undefined) updateData.card_number = card_number;
      if (full_name !== undefined) updateData.full_name = full_name;
      if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
      if (gender !== undefined) updateData.gender = gender;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (emergency_contact !== undefined)
        updateData.emergency_contact = emergency_contact;
      if (email !== undefined) updateData.email = email;
      if (blood_type !== undefined) updateData.blood_type = blood_type;
      if (known_allergies !== undefined)
        updateData.known_allergies = known_allergies;
      if (chronic_conditions !== undefined)
        updateData.chronic_conditions = chronic_conditions;
      if (current_medications !== undefined)
        updateData.current_medications = current_medications;

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
