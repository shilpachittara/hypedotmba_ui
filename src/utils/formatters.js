// Format numbers for display
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  if (num === 0) return '0';
  
  if (num < 0.000001) return num.toExponential(2);
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
  return (num / 1000000000).toFixed(2) + 'B';
};

// Truncate address for display
export const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Calculate time ago
export const calculateTimeAgo = (createdOn) => {
  if (!createdOn) return "NaN";
  
  const now = new Date();
  // Check if timestamp is in milliseconds (13 digits) or seconds (10 digits)
  const createdDate = new Date(
    createdOn.toString().length > 10 
      ? parseInt(createdOn) // Already in milliseconds
      : parseInt(createdOn) * 1000 // Convert seconds to milliseconds
  );
  
  // Check if date is valid
  if (isNaN(createdDate.getTime())) return "NaN";
  
  const diff = now - createdDate; // Time difference in milliseconds

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}m ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}; 