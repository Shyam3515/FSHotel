const generateBookingId = () =>
  `BK${Date.now().toString(36).toUpperCase()}${Math.floor(
    1000 + Math.random() * 9000
  )}`;

export default generateBookingId;