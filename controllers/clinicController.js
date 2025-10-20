const Clinic = require("../models/Clinic");
const {
  successResponse,
  errorResponse,
  validationError,
} = require("../utils/responseUtils");

const clinicController = {
  get: async (req, res) => {
    try {
      const clinic = await Clinic.getTestList();
      successResponse(res, clinic);
    } catch (error) {
      errorResponse(res, "Failed to fetch clinic settings");
    }
  },

  create: async (req, res) => {
    try {
      const {
        name,
        logo_url,
        address,
        phone,
        email,
        about_text,
        working_hours,
        test_list,
      } = req.body;

      const errors = [];
      if (!name) errors.push("Name is required");
      if (!address) errors.push("Address is required");
      if (!phone) errors.push("Phone is required");

      if (errors.length > 0) {
        return validationError(res, errors);
      }

      const clinicData = {
        name,
        logo_url,
        address,
        phone,
        email,
        about_text,
        working_hours,
        test_list,
      };

      const newClinic = await Clinic.create(clinicData);
      successResponse(
        res,
        newClinic,
        "Clinic settings created successfully",
        201
      );
    } catch (error) {
      errorResponse(res, "Failed to create clinic settings");
    }
  },

  update: async (req, res) => {
    try {
      const {
        name,
        logo_url,
        address,
        phone,
        email,
        about_text,
        working_hours,
        test_list,
      } = req.body;

      const clinicData = {};
      if (name !== undefined) clinicData.name = name;
      if (logo_url !== undefined) clinicData.logo_url = logo_url;
      if (address !== undefined) clinicData.address = address;
      if (phone !== undefined) clinicData.phone = phone;
      if (email !== undefined) clinicData.email = email;
      if (about_text !== undefined) clinicData.about_text = about_text;
      if (working_hours !== undefined) clinicData.working_hours = working_hours;
      if (test_list !== undefined) clinicData.test_list = test_list;

      const updated = await Clinic.updateSettings(clinicData);

      if (updated) {
        const updatedClinic = await Clinic.getTestList();
        successResponse(
          res,
          updatedClinic,
          "Clinic settings updated successfully"
        );
      } else {
        errorResponse(res, "Failed to update clinic settings");
      }
    } catch (error) {
      errorResponse(res, "Failed to update clinic settings");
    }
  },
};

module.exports = clinicController;
