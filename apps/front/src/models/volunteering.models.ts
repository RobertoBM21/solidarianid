export interface CreateVolunteerLogPayload {
  volunteeringActionId: string;
  start: string;
  end: string;
}

export interface VolunteerLogResponse {
  id: string;
  volunteeringActionId: string;
  volunteerId: string;
  start: string;
  end: string;
}
