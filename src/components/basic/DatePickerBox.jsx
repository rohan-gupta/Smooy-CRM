import { forwardRef } from 'react'
import InputBox from './InputBox'
import { CalendarIcon } from '../icons/StaffIcons'

const DatePickerBox = forwardRef(function DatePickerBox(
  { value, onChange, placeholder = 'Date of Birth', leftIcon, ...props },
  ref
) {
  return (
    <InputBox
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type="date"
      withPrefix={false}
      leftIcon={leftIcon || <CalendarIcon />}
      rightIcon={<CalendarIcon />}
      {...props}
    />
  )
})

export default DatePickerBox
