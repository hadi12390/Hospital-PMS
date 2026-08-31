const TYPE_LABEL = {
  consultation: "Consultation",
  follow_up: "Follow Up",
  check_up: "Check Up",
  surgery: "Surgery",
};

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DEFAULT_DURATION_MIN = 30; // API gives no end time, assume 30-min slots

export function splitName(fullName = "") {
  const [firstName, ...rest] = fullName.trim().split(" ");
  return { firstName: firstName || "", lastName: rest.join(" ") || "" };
}

export function adaptAppointment(raw) {
  // Already adapted? Just return it.
  if (raw?.dateTime) return raw;

  const { firstName, lastName } = splitName(raw.patient?.name);
  const rawDate = raw.date ?? raw.dateTime; // fallback just in case
  if (!rawDate) {
    console.warn("adaptAppointment: missing date field on", raw);
  }

  const start = new Date(rawDate);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60000);

  return {
    id: raw.appointment_public_id ?? raw.id,
    type: TYPE_LABEL[raw.appointment_type] || raw.appointment_type,
    reason: raw.resone_for_visit ?? raw.reason,
    duration: "Default",
    dateTime: rawDate.replace("Z", ""),
    status: STATUS_LABEL[raw.status] || raw.status,
    note: raw.note || "",
    createdAt: raw.created_at || null,
    end_time: end.toISOString(),
    patient: {
      publicId: raw.patient?.public_id ?? raw.patient?.publicId,
      firstName: firstName || raw.patient?.firstName || "",
      lastName: lastName || raw.patient?.lastName || "",
      photo: raw.patient?.profile_picture ?? raw.patient?.photo ?? null,
      gender: raw.patient?.gender,
      phone: raw.patient?.phone_number ?? raw.patient?.phone,
      dateOfBirth: raw.patient?.birth_date ?? raw.patient?.dateOfBirth,
      bloodType: raw.patient?.blood_type ?? raw.patient?.bloodType,
      personalId: raw.patient?.personal_id ?? raw.patient?.personalId,
    },
  };
}