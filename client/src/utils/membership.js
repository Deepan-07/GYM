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

export const calculateDaysLeft = (startDateValue, endDateValue) => {
  // Overload: if only 1 param passed, treat as endDateValue
  if (!endDateValue) {
    endDateValue = startDateValue;
    startDateValue = null;
  }

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

  if (startDateValue) {
    const startDate = new Date(startDateValue);
    startDate.setHours(0, 0, 0, 0);
    
    if (!Number.isNaN(startDate.getTime()) && today.getTime() < startDate.getTime()) {
      const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `Starts in ${diffDays} days`;
    }
  }



  return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
