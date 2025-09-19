import { type FieldValues, type Path } from 'react-hook-form'

export interface FormField<T extends FieldValues> {
  field: {
    value: any
    onChange: (...event: any[]) => void
    onBlur: () => void
    name: Path<T>
    ref: (instance: any) => void
  }
}
