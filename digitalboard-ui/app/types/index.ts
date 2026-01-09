// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Entity Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  country_code: string;
  country_name: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  city_code: string;
  city_name: string;
  country_id: number;
  country?: Country;
  created_at: string;
  updated_at: string;
}

export interface Airline {
  id: number;
  airline_code: string;
  airline_name: string;
  created_at: string;
  updated_at: string;
}

export interface Airport {
  id: number;
  airport_code: string;
  airport_name: string;
  city_id: number;
  city?: City;
  country?: Country;
  created_at: string;
  updated_at: string;
}

export interface Terminal {
  id: number;
  terminal_code: string;
  terminal_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Gate {
  id: number;
  gate_code: string;
  terminal_id: number;
  terminal?: Terminal;
  created_at: string;
  updated_at: string;
}

export interface FlightStatus {
  id: number;
  status_name: string;
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: number;
  flight_id: number;
  flight_code: string;
  airline_id: number;
  airline?: Airline;
  origin_airport_id: number;
  origin_airport?: Airport;
  destination_airport_id: number;
  destination_airport?: Airport;
  gate_id: number;
  gate?: Gate;
  terminal_id: number;
  terminal?: Terminal;
  status_id: number;
  status?: FlightStatus;
  flight_type: 'departure' | 'arrival';
  scheduled_time: string;
  actual_time: string | null;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface FlightFormData {
  airline_id: string;
  origin_airport_id: string;
  destination_airport_id: string;
  gate_id: string;
  terminal_id: string;
  status_id: string;
  flight_type: 'departure' | 'arrival';
  scheduled_time: string;
  actual_time: string;
}

export interface CountryFormData {
  country_code: string;
  country_name: string;
}

export interface AirlineFormData {
  airline_code: string;
  airline_name: string;
}

export interface AirportFormData {
  airport_code: string;
  airport_name: string;
  city_id: string;
}

export interface CityFormData {
  city_code: string;
  city_name: string;
  country_id: string;
}

export interface TerminalFormData {
  terminal_code: string;
  terminal_name: string;
  description: string;
}

export interface GateFormData {
  gate_code: string;
  terminal_id: string;
}

export interface FlightStatusFormData {
  status_name: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
}
