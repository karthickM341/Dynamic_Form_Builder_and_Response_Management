import {
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Rating,
} from "@mui/material";

import { FormField } from "../types";

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}

export default function FieldRenderer({
  field,
  value,
  onChange,
}: FieldRendererProps) {
  switch (field.field_type) {
    case "dropdown":
      return (
        <TextField
          select
          fullWidth
          label={field.label}
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={field.is_required}
        >
          {field.options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );

    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={(event) =>
                onChange(
                  event.target.checked
                )
              }
            />
          }
          label={field.label}
        />
      );

    case "radio":
      return (
        <RadioGroup
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          {field.options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      );

    case "rating":
      return (
        <Rating
          value={Number(value) || 0}
          onChange={(_, newValue) =>
            onChange(newValue)
          }
        />
      );

    case "file":
      return (
        <input
          type="file"
          onChange={(event) =>
            onChange(
              event.target.files?.[0]
                ?.name || ""
            )
          }
        />
      );

    default:
      return (
        <TextField
          fullWidth
          label={field.label}
          type={field.field_type}
          placeholder={
            field.placeholder || ""
          }
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={field.is_required}
        />
      );
  }
}