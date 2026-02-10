const PHARMACY_CATEGORIES = [
  { key: "all", label: "All Categories" },
  { key: "antibiotic", label: "Antibiotic" },
  { key: "painkiller", label: "Painkiller" },
  { key: "antipyretic", label: "Antipyretic (Fever)" },
  { key: "antacid", label: "Antacid" },
  { key: "antihistamine", label: "Antihistamine (Allergy)" },
  { key: "vitamin", label: "Vitamins" },
  { key: "supplement", label: "Supplements" },
  { key: "cough-cold", label: "Cough & Cold" },
  { key: "respiratory", label: "Respiratory Care" },
  { key: "diabetic-care", label: "Diabetic Care" },
  { key: "cardiac", label: "Cardiac / Heart Care" },
  { key: "gastro", label: "Gastrointestinal" },
  { key: "dermatology", label: "Dermatology / Skin Care" },
  { key: "eye-ear", label: "Eye & Ear Care" },
  { key: "women-care", label: "Women's Health" },
  { key: "men-care", label: "Men's Health" },
  { key: "baby-care", label: "Baby Care" },
  { key: "first-aid", label: "First Aid" },
  { key: "antiseptic", label: "Antiseptic" },
  { key: "surgical", label: "Surgical Items" }
];

const STOCK_STATUS = [
  { key: "all", label: "All" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock" },
  { key: "out_of_stock", label: "Out of Stock" },
  { key: "expired", label: "Expired" }
];

const ROLE_STAFF = [
{ key: "all", label: "All Roles" },
{ key: "pharmacist", label: "Pharmacist" },
{ key: "assistant", label: "Assistant" },
{ key: "cashier", label: "Cashier" },
];

const STAFF_STATUS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" }
];

module.exports = { PHARMACY_CATEGORIES, STOCK_STATUS, ROLE_STAFF, STAFF_STATUS };