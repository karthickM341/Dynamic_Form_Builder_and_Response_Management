export type FieldType =
  | "text"
  | "number"
  | "email"
  | "date"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "file"
  | "rating";

export interface FieldOption {
  label: string;
  value: string;
}

export interface ConditionalRule {
  field?: string;
  equals?: string | number | boolean;
}

export interface FormField {
  id?: number;

  field_name: string;

  label: string;

  placeholder?: string;

  field_type: FieldType;

  is_required: boolean;

  display_order: number;

  options: FieldOption[];

  conditional_rules?: ConditionalRule;
}

export interface FormData {
  id?: number;

  title: string;

  description: string;

  is_public: boolean;

  is_enabled: boolean;

  fields: FormField[];
}