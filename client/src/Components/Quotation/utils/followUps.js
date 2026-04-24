export function getFollowUpCount(quotation) {
  const followUpsData = quotation.followUpsNew || quotation.followUps || [];
  return Array.isArray(followUpsData) ? followUpsData.length : 0;
}

export function getNextFollowUpDate(quotation) {
  const followUpsData = quotation.followUpsNew || quotation.followUps || [];
  if (!Array.isArray(followUpsData) || followUpsData.length === 0) return null;

  const futureDates = followUpsData
    .filter((f) => {
      const dateField = f.followUpDate || f.date;
      return dateField && new Date(dateField) > new Date();
    })
    .sort(
      (a, b) =>
        new Date(a.followUpDate || a.date) - new Date(b.followUpDate || b.date)
    );

  return futureDates.length > 0
    ? futureDates[0].followUpDate || futureDates[0].date
    : null;
}

export function getFollowUpHighlight(quotation) {
  const nextFollowUp = getNextFollowUpDate(quotation);
  if (!nextFollowUp) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpDate = new Date(nextFollowUp);
  followUpDate.setHours(0, 0, 0, 0);

  if (followUpDate < today) return "overdue";
  if (followUpDate.getTime() === today.getTime()) return "today";
  return null;
}
