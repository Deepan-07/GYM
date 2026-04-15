export const formatDisplayDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-GB').replace(/\//g, '-');
};

export const calculateDaysLeft = (endDateValue) => {
  if (!endDateValue) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateValue);
  endDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  return Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
