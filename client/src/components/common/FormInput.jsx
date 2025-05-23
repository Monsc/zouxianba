import React from 'react';
import { useFormContext } from 'react-hook-form';

const FormInput = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  pattern,
  errorMessage,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        {...register(name, {
          required: required && '此字段为必填项',
          pattern: pattern && {
            value: pattern,
            message: errorMessage,
          },
        })}
        {...props}
      />
      {errors[name] && <p className="text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );
};

export default FormInput;
