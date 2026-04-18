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

const buildMembershipWindow = ({ startDate, durationMonths, today = new Date() }) => {
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedToday = normalizeDate(today);
  const endDate = new Date(normalizedStartDate);

  endDate.setMonth(endDate.getMonth() + Number(durationMonths));

  if (normalizedToday < normalizedStartDate) {
    const diffTime = normalizedStartDate.getTime() - normalizedToday.getTime();
    const daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      startDate: normalizedStartDate,
      endDate,
      status: 'upcoming',
      daysUntilStart,
      daysLeft: 0
    };
  }

  const diffTime = endDate.getTime() - normalizedToday.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (normalizedToday >= normalizedStartDate && normalizedToday <= endDate) {
    return {
      startDate: normalizedStartDate,
      endDate,
      status: getMembershipStatus(daysLeft),
      daysLeft
    };
  }

  // expired
  return {
    startDate: normalizedStartDate,
    endDate,
    status: getMembershipStatus(daysLeft),
    daysLeft: 0
  };
};

module.exports = {
  normalizeDate,
  getMembershipStatus,
  buildMembershipWindow
};
