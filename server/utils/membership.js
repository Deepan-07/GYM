const normalizeDate = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildMembershipWindow = ({ startDate, durationMonths, today = new Date() }) => {
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedToday = normalizeDate(today);
  const endDate = new Date(normalizedStartDate);
  endDate.setMonth(endDate.getMonth() + Number(durationMonths));

  const diffTime = endDate.getTime() - normalizedToday.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    startDate: normalizedStartDate,
    endDate,
    daysLeft
  };
};

const getPlanStatus = (plan, today = new Date()) => {
  const normalizedToday = normalizeDate(today);
  const normalizedStart = normalizeDate(plan.startDate);
  const normalizedEnd = normalizeDate(plan.endDate);

  if (normalizedToday < normalizedStart) {
    return 'Upcoming';
  }
  if (normalizedToday > normalizedEnd) {
    return 'Expired';
  }
  return 'Active';
};

const getPaymentStatus = (plan, today = new Date()) => {
  const normalizedToday = normalizeDate(today);
  const normalizedStart = normalizeDate(plan.startDate);
  const normalizedDue = plan.dueDate ? normalizeDate(plan.dueDate) : null;
  
  const finalPrice = Number(plan.finalPrice) || 0;
  const totalPaid = Number(plan.totalPaid) || 0;

  if (totalPaid >= finalPrice && finalPrice > 0) {
    return 'PAID';
  }

  // Before start date, it's pending (cannot be overdue before start)
  if (normalizedToday < normalizedStart) {
    return 'PENDING';
  }

  // If due date exists and hasn't passed, it's pending (grace period)
  if (normalizedDue && normalizedToday <= normalizedDue) {
    return 'PENDING';
  }

  // Plan started (or expired) and payment incomplete and (due date passed or no due date)
  return 'OVERDUE';
};

const getClientPlans = (memberships, today = new Date()) => {
  if (!memberships || !Array.isArray(memberships)) {
    return { currentPlan: null, nextPlan: null, previousPlans: [], gaps: [] };
  }

  const sorted = [...memberships].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  let currentPlan = null;
  let nextPlan = null;
  const previousPlans = [];
  const gaps = [];

  for (let i = 0; i < sorted.length; i++) {
    const plan = sorted[i];
    const mStatus = getPlanStatus(plan, today);
    const pStatus = getPaymentStatus(plan, today);
    
    // Attach dynamic statuses
    const enrichedPlan = { 
      ...plan.toObject ? plan.toObject() : plan, 
      status: mStatus, 
      paymentStatus: pStatus 
    };

    if (mStatus === 'Active') {
      currentPlan = enrichedPlan;
    } else if (mStatus === 'Upcoming' && !nextPlan) {
      nextPlan = enrichedPlan;
    } else if (mStatus === 'Expired') {
      previousPlans.push(enrichedPlan);
    }

    // Gap Detection
    if (i < sorted.length - 1) {
      const currentEnd = normalizeDate(plan.endDate);
      const nextStart = normalizeDate(sorted[i + 1].startDate);
      
      const oneDay = 24 * 60 * 60 * 1000;
      if (nextStart.getTime() > currentEnd.getTime() + oneDay) {
        gaps.push({
          from: new Date(currentEnd.getTime() + oneDay),
          to: new Date(nextStart.getTime() - oneDay)
        });
      }
    }
  }

  return { 
    currentPlan, 
    nextPlan, 
    previousPlans: previousPlans.reverse(),
    gaps
  };
};

module.exports = {
  normalizeDate,
  getPlanStatus,
  getPaymentStatus,
  getClientPlans,
  buildMembershipWindow
};
