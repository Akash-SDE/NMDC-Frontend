export const RAILWAY_WAGON_FLAGS = [
  { id: "overloaded", label: "Overloaded" },
  { id: "uneven_rake", label: "Uneven Rake" },
  { id: "uneven", label: "Uneven" },
  { id: "sick", label: "Sick" },
  { id: "repair", label: "Repair" },
  { id: "door_unlock", label: "Door / Unlock Issue" },
  { id: "single_bar", label: "Single Bar Issue" },
  { id: "downside_check", label: "Downside Check Issue" },
];

export const RAILWAY_FLAG_LABELS = Object.fromEntries(
  RAILWAY_WAGON_FLAGS.map((flag) => [flag.id, flag.label]),
);
