import { PharmacySettings } from "../models/PharmacySettings.js";

const getOrCreateSettings = async () => {
  let settings = await PharmacySettings.findOne();
  if (!settings) {
    settings = await PharmacySettings.create({});
  }
  return settings;
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const upsertSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    const payload = {
      pharmacyName: req.body.pharmacyName ?? settings.pharmacyName,
      contactEmail: req.body.contactEmail ?? settings.contactEmail,
      contactPhone: req.body.contactPhone ?? settings.contactPhone,
      location: req.body.location ?? settings.location,
      address: req.body.address ?? settings.address,
      website: req.body.website ?? settings.website,
      logoUrl: req.body.logoUrl ?? settings.logoUrl
    };

    const updated = await PharmacySettings.findByIdAndUpdate(settings._id, payload, {
      new: true,
      runValidators: true
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
