// Helper utility functions

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  
  return dateObj.toLocaleDateString('en-AU', options);
};

/**
 * Get status color based on status type
 * @param {string} status - Status value
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'ongoing':
      return '#007AFF';
    case 'finished':
    case 'completed':
      return '#4CAF50';
    case 'planned':
      return '#FF9800';
    default:
      return '#666666';
  }
};

/**
 * Sort properties by specified criteria
 * @param {Array} properties - Array of properties
 * @param {string} sortBy - Sort criteria (newest, oldest, a-z, z-a)
 * @returns {Array} Sorted properties array
 */
export const sortProperties = (properties, sortBy) => {
  const sorted = [...properties];
  
  switch (sortBy) {
    case 'oldest':
      return sorted.reverse();
    case 'a-z':
      return sorted.sort((a, b) => a.address.localeCompare(b.address));
    case 'z-a':
      return sorted.sort((a, b) => b.address.localeCompare(a.address));
    case 'newest':
    default:
      return sorted;
  }
};

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Australian)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('61')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};
