const Test = require("../models/Test");

class ReferenceRangeUtils {
  static async getApplicableRange(
    testId,
    patientGender,
    patientAge,
    conditions = {}
  ) {
    try {
      const ranges = await Test.getReferenceRanges(testId);

      // Filter ranges based on patient criteria
      const applicableRanges = ranges.filter((range) => {
        // Check gender match
        if (range.gender !== "both" && range.gender !== patientGender) {
          return false;
        }

        // Check age range
        if (
          (range.min_age !== null && patientAge < range.min_age) ||
          (range.max_age !== null && patientAge > range.max_age)
        ) {
          return false;
        }

        // Check special conditions (like pregnancy)
        if (range.conditions && range.conditions !== "general") {
          if (range.conditions === "pregnant" && !conditions.isPregnant) {
            return false;
          }
          // Add more condition checks as needed
        }

        return true;
      });

      // Return the most specific range found
      if (applicableRanges.length > 0) {
        // Sort by specificity (conditions first, then gender specificity)
        applicableRanges.sort((a, b) => {
          const aScore = this.calculateSpecificityScore(
            a,
            patientGender,
            conditions
          );
          const bScore = this.calculateSpecificityScore(
            b,
            patientGender,
            conditions
          );
          return bScore - aScore;
        });

        return applicableRanges[0];
      }

      return null;
    } catch (error) {
      console.error("Error getting applicable range:", error);
      return null;
    }
  }

  static calculateSpecificityScore(range, patientGender, conditions) {
    let score = 0;

    // Conditions make it more specific
    if (range.conditions && range.conditions !== "general") {
      score += 10;
    }

    // Gender-specific ranges are more specific than 'both'
    if (range.gender !== "both" && range.gender === patientGender) {
      score += 5;
    }

    // Narrower age ranges are more specific
    if (range.min_age !== null && range.max_age !== null) {
      const ageRange = range.max_age - range.min_age;
      score += Math.max(0, 10 - ageRange / 10);
    }

    return score;
  }

  static interpretResult(resultValue, referenceRange) {
    if (!referenceRange) {
      return {
        status: "normal",
        interpretation: "No reference range available",
      };
    }

    const numericValue = parseFloat(resultValue);
    if (isNaN(numericValue)) {
      return { status: "normal", interpretation: "Non-numeric result" };
    }

    let status = "normal";
    let interpretation = "Within normal range";

    if (
      referenceRange.critical_low !== null &&
      numericValue < referenceRange.critical_low
    ) {
      status = "critical";
      interpretation = "CRITICALLY LOW";
    } else if (
      referenceRange.critical_high !== null &&
      numericValue > referenceRange.critical_high
    ) {
      status = "critical";
      interpretation = "CRITICALLY HIGH";
    } else if (numericValue < referenceRange.min_value) {
      status = "low";
      interpretation = "Below normal range";
    } else if (numericValue > referenceRange.max_value) {
      status = "high";
      interpretation = "Above normal range";
    }

    return {
      status,
      interpretation,
      normal_range: `${referenceRange.min_value} - ${referenceRange.max_value} ${referenceRange.unit}`,
      critical_low: referenceRange.critical_low,
      critical_high: referenceRange.critical_high,
    };
  }
}

module.exports = ReferenceRangeUtils;
