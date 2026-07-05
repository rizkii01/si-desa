import React from 'react';

export default function DynamicLetterForm({ schema, values, errors, onChange }) {
  if (!schema || !schema.fields) {
    return null;
  }

  // Filter fields based on showWhen conditions
  const visibleFields = schema.fields.filter((field) => {
    if (!field.showWhen) return true;
    const dependentValue = values?.[field.showWhen.field];
    return dependentValue === field.showWhen.value;
  });

  const handleChange = (fieldKey, value) => {
    if (onChange) {
      onChange(fieldKey, value);
    }
  };

  const renderField = (field) => {
    const hasError = errors && field.label in errors;
    const errorMessage = hasError ? errors[field.label] : null;

    const commonProps = {
      id: field.key,
      name: field.key,
      value: values?.[field.key] || '',
      onChange: (e) => handleChange(field.key, e.target.value),
      placeholder: field.placeholder || '',
      className: `mt-1 block w-full rounded-md border ${
        hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      } shadow-sm py-2 px-3 sm:text-sm transition-colors duration-200`,
    };

    const labelElement = (
      <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="ml-1 text-red-600">*</span>}
      </label>
    );

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="mb-4">
            {labelElement}
            <textarea
              {...commonProps}
              rows={3}
              className={`${commonProps.className} resize-y`}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="mb-4">
            {labelElement}
            <select
              {...commonProps}
              className={`${commonProps.className} bg-white`}
            >
              <option value="">Pilih...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="mb-4">
            {labelElement}
            <input
              {...commonProps}
              type="number"
              min="0"
              className={`${commonProps.className} number-input`}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.key} className="mb-4">
            {labelElement}
            <input
              {...commonProps}
              type="date"
              className={commonProps.className}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.key} className="mb-4">
            {labelElement}
            <input
              {...commonProps}
              type="text"
              className={commonProps.className}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 border border-gray-200">
      {visibleFields.length > 0 ? (
        visibleFields.map((field) => renderField(field))
      ) : (
        <p className="text-sm text-gray-500 italic">Tidak ada field yang tersedia untuk jenis surat ini.</p>
      )}
    </div>
  );
}
