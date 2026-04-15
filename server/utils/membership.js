const normalizeDate = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getMembershipStatus = (daysLeft) => {
  if (daysLeft > 3) {
    return 'active';
  }

  if (daysLeft >= 0) {
    return 'expiring_soon';
  }

  if (daysLeft >= -3) {
    return 'expired';
  }

  return 'red_tag';
};

const buildMembershipWindow = ({ startDate, durationDays, today = new Date() }) => {
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedToday = normalizeDate(today);
  const endDate = new Date(normalizedStartDate);

  endDate.setDate(endDate.getDate() + Number(durationDays) - 1);

  const diffTime = endDate.getTime() - normalizedToday.getTime();
  const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    startDate: normalizedStartDate,
    endDate,
    daysLeft,
    status: getMembershipStatus(daysLeft)
  };
};

module.exports = {
  normalizeDate,
  getMembershipStatus,
  buildMembershipWindow
};
