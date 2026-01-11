import { VolunteerLog } from '../../domain/aggregates/volunteer-log.aggregate';

export class VolunteerLogDto {
  /**
   * The unique identifier of the volunteer log.
   */
  id: string;

  /**
   * The ID of the volunteering action.
   */
  volunteeringActionId: string;

  /**
   * The ID of the volunteer.
   */
  volunteerId: string;

  /**
   * The start date and time of the participation.
   */
  start: string;

  /**
   * The end date and time of the participation.
   */
  end: string;

  constructor(log: VolunteerLog) {
    this.id = log.id.toString();
    this.volunteeringActionId = log.volunteeringActionId;
    this.volunteerId = log.volunteerId;
    this.start = log.start.toISOString();
    this.end = log.end.toISOString();
  }
}
