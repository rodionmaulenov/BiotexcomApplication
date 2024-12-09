export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProfileResults {
  results: Profile[];
}

export interface Profile {
  id: number;
  full_name: string;
  file: string;
  days_passed: number;
  days_left: number;
  date_update: string;
  date_update_in_ukr_or_mld: string;
  disable: boolean;
}

export interface ProfileUzb {
  id: number;
  full_name: string;
  file: string;
  day_stayed: number;
  day_update_ukr: string;
  day_update_mld: string;
  disable: boolean;
}

export interface notInProgramProfile {
  id: number;
  full_name: string;
  file: string;
}

export interface DateTableEntry {
  entry: Date;
  exit: Date;
  country: string;
  files: string | null;
  disable: boolean;
  created: Date;
}

export interface CreateProfile {
  full_name: string | null;
  country: string | null;
  profileName: string | null;
  avatar: string | null;
  datesTable: DateTableEntry[];
}

export interface PaginationDetails {
  count: number;
  next: string | null;
  previous: string | null;
}


interface DayInfo {
  days_left: number;
}

export interface DaysLeftMap {
  [key: number]: DayInfo;
}

// Interface for individual ProfileNames
export interface ProfileName {
  full_name: string;
}


// Interface for the response containing an array of profileNames
export interface ProfileNameResults {
  results: ProfileName[];
}


//
// export interface DateEntrUpdate {
//   entry: string
//   exit: string;
//   country: string;
//   disable: boolean;
//   files: (string | null)[];
//   status: string;
//   created: Date;
//   deleted: boolean;
//   updated: boolean;
// }
//
// // Main profile interface
// export interface ProfileUpdate {
//   avatar: string | null;
//   country: string | null;
//   datesTable: DateEntrUpdate[];
//   full_name: string | null;
//   updated: boolean | null;
// }


